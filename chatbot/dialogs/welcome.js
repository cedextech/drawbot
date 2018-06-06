var builder = require('botbuilder')

module.exports = function(bot, db){
	bot.dialog('/getStarted', [
		function(session, args, next){
			session.send('Hi, I\'m your art teacher. I can teach you to draw things.')
			session.beginDialog('/beginTeaching')
		}
	])
	.triggerAction({
		matches: [/^hi$/i, /^hello$/i, /^begin$/i, /^start$/i, /^restart$/i]
	})
}