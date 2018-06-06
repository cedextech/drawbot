const unrecognized = {
	entities: [],
	intent: null,
	intents: [],
	score: 0
};

const parse = {
	parse: function(context, payload) {
		// console.log(context)
		// console.log('inside postback parse')
		if (payload === null) {
			// console.log('unrecognized')
			return unrecognized;
		}
		try {
			var payload = JSON.parse(payload);
		} catch (ex) {

		}
		if (payload === 'getStarted' || payload === 'restart') {
			// console.log("***************************************")
			return {
				intent: payload,
				score: 1
			};
		}
	}
}

module.exports = {
	recognize: function(context, callback) {
		if (context.message.sourceEvent !== undefined && context.message.sourceEvent.postback !== undefined) {
			const payload = context.message.sourceEvent.postback.payload;
			callback.call(null, null, parse.parse(context, payload));
		} else {
			callback.call(null, null, parse.parse(context, null));
		}
	}
};
