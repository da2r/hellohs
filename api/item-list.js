const BaseApi = require('./base');

const dbutil = require('../util/dbutil');

class Class extends BaseApi {

	async execute() {
		const client = dbutil.client();
		await client.connect()
		try {
			const rs = await client.query('SELECT * from item')
			return rs.rows;
		} catch (t) {
			throw t
		} finally {
			client.end()
		}
	}

}

module.exports = Class;