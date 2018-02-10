const BaseSelect = require('./base');

const dbutil = require('../util/dbutil');

class Class extends BaseSelect {

	async execute() {
		const client = dbutil.client();
		await client.connect()
		try {
			const term = this.param.term;

			let sql;
			let param;
			if (term) {
				sql = 'SELECT * FROM item WHERE UPPER(name) LIKE $1';
				param = [`%${this.param.term.toUpperCase()}%`];
			} else {
				sql = 'SELECT * FROM item';
				param = [];
			}

			const rs = await client.query(sql, param)

			let results = [];
			if (rs.rows && rs.rows.length) {
				for (let index = 0; index < rs.rows.length; index++) {
					const row = rs.rows[index];

					results.push({
						id: row.id,
						text: row.name,
						data: row
					})
				}
			}

			return {
				code: 200,
				term: term,
				results: results
			}
		} catch (t) {
			throw t
		} finally {
			client.end()
		}
	}

}

module.exports = Class;