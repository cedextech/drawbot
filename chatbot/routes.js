var builder = require('botbuilder');

const dialogs = {
	GetStarted: require('./dialogs/welcome'),
	TeachArt: require('./dialogs/teach'),
	ConfusedResponse: require('./dialogs/confusedResponse')
};

module.exports = {
	route: function(intents, bot, db){
		// console.log(intents);
		intents.matches('getStarted','/getStarted');
		intents.onDefault('/confusedResponse');

		bot.dialog('/', intents);

		dialogs.GetStarted(bot, db);
		dialogs.TeachArt(bot, db);
		dialogs.ConfusedResponse(bot, db);

		/*bot.on('conversationUpdate', function (message) {
			// console.log(message)
		    if (message.membersAdded) {
		        message.membersAdded.forEach(function (identity) {
		            if (identity.id === message.address.bot.id) {
						bot.beginDialog(message.address, '/suggestedBeginning')
		            }
		        });
		    }
		});*/
	}
};