const hs = require('./hs');
const cnutil = require('./util/cnutil');
const dbutil = require('./util/dbutil');

const CODE_OK = 200;
const CODE_USER_ERROR = 400;
const CODE_INTERNAL_ERROR = 500;

async function execute(req, res) {
	const cls = req.body.entity;
	if (cls === undefined || cls === null || cls.endsWith('.js') || cls.indexOf('..') > -1) {
		throw 'malformedurl';
	}

	const proc = req.body.proc;

	let content = req.body.content;
	if (cnutil.isJSON(content)) {
		content = JSON.parse(content);
	}

	const service = hs.getService(cls);

	const db = dbutil.client();
	await db.connect()
	try {
		const ctx = {
			db: db,
			content: content
		}

		let procedure = service[proc];
		if (typeof procedure !== 'function') {
			throw `Invalid service function ${cls} - ${proc}`;
		}

		let result = await procedure(ctx);

		await db.query('COMMIT')

		return {
			code: CODE_OK,
			result: result
		};
	} catch (t) {
		await db.query('ROLLBACK')
		throw t
	} finally {
		db.end()
	}

	return {
		code: CODE_USER_ERROR,
		message: 'Unhandled request'
	};
};

module.exports = function (req, res, next) {
	execute(req, res).then((resp) => {
		if (resp) {
			res.json(resp);
		} else {
			throw 'No response message';
		}
	}).catch((t) => {
		console.error(t);
		res.json({
			code: CODE_INTERNAL_ERROR,
			message: cnutil.errorMessage(t),
		})
	});
};