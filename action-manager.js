function handleError(t, req, res) {
	console.error(t);
	res.json({
		code: 500,
		message: t,
		trace: {
			url: req.url
		}
	})
}

function execute(req, res) {
	try {
		let doc = req.url.substr(1);

		let pos = doc.indexOf('?');
		if (pos > -1) {
			doc = doc.substr(0, pos);
		}

		if (doc === '') {
			doc = 'index';
		}

		if (doc.endsWith('.js') || doc.indexOf('..') > -1) {
			throw 'malformedurl';
		}

		const ActionClass = require('./action/' + doc);
		const action = new ActionClass();

		action.init(doc, req, res);
		action.doExecute().catch(function (t) {
			handleError(t, req, res);
		});
	} catch (t) {
		handleError(t, req, res);
	}
}

module.exports = execute;