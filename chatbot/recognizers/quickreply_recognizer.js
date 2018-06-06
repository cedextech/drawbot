const unrecognized = {
	entities: [],
	intent: null,
	intents: [],
	score: 0
};

const parse = {
	parse: function(context, payload) {
		if (payload === null) {
			return unrecognized;
		}
		try {
			var payload = JSON.parse(payload);
		} catch (ex) {

		}
		if (payload === 'getstarted' || payload === 'cancel' || payload === 'help' || payload === 'menu' || payload === 'options') {
			// console.log("-----+++++++++++++++++++++++++++++++")
			return {
				intent: 'getStarted',
				score: 1
			};
		}
	}
}

module.exports = {
	recognize: function(context, callback) {
    // console.log("================== INSIDE QUICKREPLY ===========================");
		if (context.message.text !== undefined) {
			const payload = context.message.text;
			callback.call(null, null, parse.parse(context, payload.toLowerCase().replace(/\s/g,'')));
		} else {
			callback.call(null, null, parse.parse(context, null));
		}
	}
};
