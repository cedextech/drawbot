// to handle environmental variables
require('dotenv').config()

var builder = require('botbuilder')
var restify = require('restify')
var router = require('./routes.js')
var postback_recognizer = require('./recognizers/postback_recognizer')
var quickreply_recognizer = require('./recognizers/quickreply_recognizer')
var Cacheman = require('cacheman');
var db = new Cacheman();

const express = require('express')
const app = express()
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var jsonParser = bodyParser.json()


// create a connector to microsoft bot framework
var connector = new builder.ChatConnector({
	appId: process.env.MICROSOFT_APP_ID,
	appPassword: process.env.MICROSOFT_APP_PASSWORD
})

// create a bot brain.
var bot = new builder.UniversalBot(connector, {
	persistConversationData: true
})
// make that bot to send a response "..typing" to the chat window
bot.use(builder.Middleware.sendTyping())


//###########################################################################################################

// IntentDialog recognizers user's intent and and optionally extracts entities
var intents = new builder.IntentDialog({
	recognizers: [
		quickreply_recognizer,
		postback_recognizer
	],
	intentThreshold: 0.2,
	recognizeOrder: builder.RecognizeOrder.series
})

router.route(intents, bot, db)

//###########################################################################################################

// setup restify server to establish communication
/*var server = restify.createServer()
server.listen(process.env.port || process.env.PORT || 4000, function(){
	console.log('%s listening to %s',server.name,server.url)
})*/
app.listen(process.env.PORT || 4000, () => console.log('Example app listening on port 4000!'))
// make this connector listen to message endpoint
app.post('/api/messages', jsonParser, connector.listen())
app.post('/api/actions', urlencodedParser, (req, res, next) => {
	var user = req.body.user
	console.log(user)
	db.get(''+user, (err, val) => {
		if (! err && val){
			console.log('---',val)
			// val = JSON.parse(val)
			var savedAddress = val.savedAddress
			var item = val.currentItemToDraw
			var prediction = req.body.prediction
			var msgTrigger = new builder.Message().text('__PREDICTION__::'+item+'::'+JSON.stringify(prediction)).address(savedAddress)
			// mock the receiving of the message that triggers intent
			bot.receive(msgTrigger.toMessage())
			res.send('done.')
			next()
		} else {
			res.send('no such user.')
			console.log('no such user.')
		}
	})
})