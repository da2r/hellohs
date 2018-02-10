const BaseApi = require('./base');

const dbutil = require('../util/dbutil');
const cnutil = require('../util/cnutil');

class Class extends BaseApi {

	async execute() {
		const client = dbutil.client();
		await client.connect()
		try {
			await client.query('BEGIN')

			const data = await this.readParam(client);
			const resultId = await dbutil.save(client, 'item', data)
			const row = await dbutil.selectById(client, 'item', resultId);

			await client.query('COMMIT')

			return {
				code: 200,
				id: resultId,
				row: row
			};
		} catch (t) {
			await client.query('ROLLBACK')
			throw t
		} finally {
			client.end()
		}
	}

	async readParam(client) {
		let result = this.param;

		if (cnutil.isBlank(result.name)) {
			throw 'Nama Barang harus diisi';
		}

		if (cnutil.isBlank(result.dept)) {
			throw 'Departemen harus diisi';
		}

		if (!result.id) {
			const exists = await dbutil.existsIC(client, 'item', 'name', result.name);
			if (exists) {
				throw `Barang dengan nama "${result.name}" sudah ada`;
			}
		}

		return result;
	}

}

module.exports = Class;