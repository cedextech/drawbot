from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

# Imports
import numpy as np
import tensorflow as tf

import flask
from flask import request
from flask import jsonify
import json 

def predict(in_array):
    tf.reset_default_graph()  
    imported_meta = tf.train.import_meta_graph("./models/model.ckpt-20000.meta") 

    with tf.Session() as sess:  
        imported_meta.restore(sess, tf.train.latest_checkpoint('./models/'))
        graph = tf.get_default_graph()
        input = graph.get_tensor_by_name("input_layer:0")
        new_samples = np.array(in_array, dtype=np.float32)
        dummy = np.zeros((99,784))
        new_samples = np.append(new_samples,dummy)
        new_samples = np.reshape(new_samples, (-1,28,28,1))
        feed_dict ={"input_layer:0":new_samples}
        op_to_restore = graph.get_tensor_by_name("softmax_tensor:0")
        return sess.run(op_to_restore,feed_dict)[0]


app = flask.Flask(__name__)
@app.route('/demo',methods=['POST','GET'])
def demo():
    if request.method == 'POST':
        prediction = predict(request.get_json())
        print(prediction)
        return jsonify(json.dumps({'resp':prediction.tolist()}))
    return '''
    <!doctype html>
    <html>
        <head>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.6.1/p5.js"></script>
            <script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
            <script>
                var img_arr = (new Array(28*28)).fill(0)
                var labels = ['duck', 'apple', 'bucket', 'diamond', 'arm', 'face', 'cat', 'basketball', 'car', 'ant']
                console.log(img_arr)
                function setup(){
                    var canv = createCanvas(560,560)
                    canv.parent('sketch-holder')
                }

                function draw(){
                    background(0)
                    if (mouseIsPressed) {
                        var pos_x = floor(mouseX/20)
                        var pos_y = floor(mouseY/20)
                        var index = (pos_x)+(pos_y*28)
                        if (index < 28*28 ) {
                            img_arr[index] = 1
                        }
                    }
                    var index = -1
                    img_arr.forEach((bit) => {
                        index ++
                        var pos_x = floor(index%28)*20
                        var pos_y = floor(index/28)*20
                        fill(bit*255)
                        noStroke()
                        ellipse(pos_x, pos_y, 20, 20)
                    })
                }

                function send(){
                    $.ajax({
                        type: 'POST',
                        url: '/demo',
                        data: JSON.stringify(img_arr),
                        success: function(data) { 
                            var resp = JSON.parse(data).resp
                            var tmp = {}
                            var i = 0
                            resp.forEach((elm)=>{
                                tmp[elm] = labels[i]
                                i++
                            })
                            var tmp1 = []
                            Object.keys(tmp).sort().forEach(function(key) {
                              tmp1.push(tmp[key])
                            });


                            $("#text").html(tmp1.reverse().join(', '))
                            img_arr = (new Array(28*28)).fill(0) 
                        },
                        contentType: "application/json",
                        dataType: 'json'
                    })
                }
            </script>
            <style>
                html, body {margin: 0; height: 100%; overflow: hidden}
            </style>
        </head>
        <body>
            <div id="sketch-holder"></div>
            <button onclick="send()">send</button>
            <p id="text">----</p>
        </body>
    </html>
    '''

import os
ON_HEROKU = os.environ.get('ON_HEROKU')

if ON_HEROKU:
    # get the heroku port
    port = int(os.environ.get('PORT', 17995))  # as per OP comments default is 17995
else:
    port = 3000
app.run(host="localhost", port=port, debug=True, use_reloader=False)
