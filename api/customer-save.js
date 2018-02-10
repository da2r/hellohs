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
			const result = await dbutil.save(client, 'customer', data)

			await client.query('COMMIT')

			return {
				code: 200,
				id: result,
				message: `pelanggan "${data.name}" berhasil disimpan`
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
			throw 'Nama harus diisi';
		}

		if (!result.id) {
			const exists = await dbutil.exists(client, 'customer', 'name', result.name);
			if (exists) {
				throw `Pelanggan dengan nama "${result.name}" sudah ada`;
			}
		}

		return result;
	}

}

module.exports = Class;