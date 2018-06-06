module.exports = function(bot, db){
	bot.dialog('/confusedResponse', [
		function(session, args, next){
			session.send("Sorry, I'm confused");
			session.endDialog();
		}
	]);
};