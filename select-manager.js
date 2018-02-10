function outputError(res, t) {
	console.error(t);
	res.json({
		code: 500,
		message: t,
	})
}

function execute(req, res) {
	try {
		let doc = req.url.substr(1);

		let pos = doc.indexOf('?');
		if (pos > -1) {
			doc = doc.substr(0, pos);
		}

		if (doc.endsWith('.js') || doc.indexOf('..') > -1) {
			throw 'malformedurl';
		}

		const Class = require('./' + doc);
		
		const select = new Class();
		select.init(req.query, req, res)

		select.execute().then(function (result) {
			res.json(result)
		}).catch(function (t) {
			outputError(res, t)
		});
	} catch (t) {
		outputError(res, t);
	}
}

module.exports = execute;