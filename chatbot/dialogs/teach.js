var builder = require('botbuilder')

var server_API_url = '<YOUR SERVER API URL>'

var labels = ['a duck', 'an apple', 'a bucket', 'a diamond', 'an arm', 'a face', 'a cat', 'a basketball', 'a car', 'an ant']
var labels_x = ['http://images.wisegeek.com/duck.jpg', 
				'http://www.bluestarclinic.com/wp-content/uploads/2013/12/apple-img.jpg', 
				'https://www.hobbycraft.co.uk/supplyimages/593020_1000_1_800.jpg', 
				'http://jewelleryphotographymumbai.in/blog/wp-content/uploads/2017/06/flawless-diamond.png', 
				'https://image.freepik.com/free-photo/collection-of-woman-hands-on-white-background_1088-807.jpg', 
				'https://img00.deviantart.net/f37f/i/2011/207/e/d/cartoon_guy___michael_edewaard_by_apthanicest-d41plaq.png', 
				'https://i.pinimg.com/originals/b6/59/eb/b659eba87e46ac95efe9785610de68fb.jpg', 
				'https://az616578.vo.msecnd.net/files/2016/04/12/635960876832893706181535308_basketball.jpg', 
				'https://images.hgmsites.net/lrg/2011-volvo-c30-2-door-coupe-auto-side-exterior-view_100311857_l.jpg', 
				'http://jonlieffmd.com/wp-content/uploads/2012/02/Ant-individual-.jpg']
var currentItemToDraw = null

module.exports = function(bot, db){
	bot.dialog('/beginTeaching', [
		function(session, args, next){
			builder.Prompts.choice(session, "I will ask you to draw some objects and we will see how well you perform. \nShall we begin?", "Yes|Later", { listStyle: builder.ListStyle.button })
		},
		function (session, results) {
			if (results.response) {
				if (results.response.entity === 'Yes'){
					session.beginDialog('/askToDraw')
					session.endDialog()
				} else {
					session.send('See you later. Just type \'Get started\', when you feel free.') 
					session.endDialog()
				}
			}
		}
	])

	bot.dialog('/askToDraw', [
		function(session, args, next){
			currentItemToDraw = Math.floor(Math.random() * (10))
			session.send('Can you draw '+labels[currentItemToDraw]+'?')
			console.log(session.message)
			db.set(''+session.message.user.id, {currentItemToDraw:currentItemToDraw, savedAddress:session.message.address}, (err) => {
				var card = [{
					'title': 'Here is '+labels[currentItemToDraw],
					'image_url': labels_x[currentItemToDraw],
					'buttons': 
					[{
						'type': 'web_url',
						'url': server_API_url+session.message.user.id,
						'title': 'click to draw',
						'webview_height_ratio': 'tall',
						'messenger_extensions': true
					}]
				}]

				sendUrlCards(session, card)
				session.endDialog()
			})
		}
	])
	.triggerAction({
		matches: [/^draw$/i]
	})

	bot.dialog('/gotImage', [
		function(session, args, next){
			session.send('I got your drawing, I\'m taking a \'DEEP\' look at it.')

			var split_array = session.message.text.split('::')
			var prediction = JSON.parse(split_array[2])
			var item = split_array[1]
			var labels_t = ['duck', 'apple', 'bucket', 'diamond', 'arm', 'face', 'cat', 'basketball', 'car', 'ant']
			var tmp = {}
			var i = 0
			prediction.forEach((elm)=>{
				tmp[elm] = labels_t[i]
				i++
			})
			var tmp1 = []
			Object.keys(tmp).sort().forEach(function(key) {
			  tmp1.push(tmp[key])
			})
			// tmp1 = tmp1.reverse()

			var score = (tmp1.indexOf(labels_t[item])+1)*10
			var msg = ''
			switch(score){
				case 10: msg = 'Hey, this is not '+labels[item]+'! :( Your score is 10/100.'; break;
				case 20: msg = 'Mm.. Frankly, that was really bad! Your score is 20/100.'; break;
				case 30: msg = 'Mm.. Your imagination doesn\'t make a perfect '+labels[item]+'! Your score is 30/100.'; break;
				case 40: msg = 'You need a lot of room space to work, I suppose. Your score is 40/100.'; break;
				case 50: msg = 'Hey, You made it to the half part! Your score is 50/100.'; break;
				case 60: msg = 'You have a good imagination, but this is not a perfect '+labels[item]+'. Your score is 60/100.'; break;
				case 70: msg = 'Hurrey., Almost there. Your score is 70/100.'; break;
				case 80: msg = 'Wow! that\'s not bad. ;) Your score is 80/100.'; break;
				case 90: msg = 'Awesome! That was a really nice drawing of '+labels[item]+'. :) Your score is 90/100.'; break;
				case 100: msg = 'Great work! We need a musium to showcase your art works! (Y) (Y) (Y) Your score is 100/100.'; break;
				default: msg = 'My mistake. I can\'t make sense of your imagination.';
			}
			session.send(msg)
			session.beginDialog('/tryAnother')
			
		}
		
	])
	.triggerAction({
		matches: [/^__PREDICTION__::.*/i]
	})

	bot.dialog('/tryAnother', [
		function(session, args, next){
			builder.Prompts.choice(session, "Ready to try another one?", "Yes|Later", { listStyle: builder.ListStyle.button })
		},
		function (session, results) {
			if (results.response) {
				if (results.response.entity === 'Yes'){
					session.beginDialog('/askToDraw')
					session.endDialog()
				} else {
					session.send('See you later. Just type \'Get started\', when you feel free.') 
					session.endDialog()
				}
			}
		}
	])
}

function sendUrlCards(session, cards) {
	var xx = {facebook: {
			attachment: {
				type: 'template',
				payload: {
					template_type: 'generic',
					elements: cards
				}
			}
		}}
	console.log(JSON.stringify(xx))
	var msg = new builder.Message(session).sourceEvent({
		facebook: {
			attachment: {
				type: 'template',
				payload: {
					template_type: 'generic',
					elements: cards
				}
			}
		}
	})
	session.send(msg)
}