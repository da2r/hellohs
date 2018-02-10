const BaseAction = require('./base');

const dbutil = require('../util/dbutil');

class ActionClass extends BaseAction {

	async execute() {
		const client = dbutil.client();
		await client.connect()
		try {

			const rs = await client.query('select * from item order by id desc');
			const data = rs.rows;

			let page = {
				title: 'Daftar Barang',
				pageJS: '/static/model/item-list.js',
				backUrl: '/index',
				contentData: {
					data: data
				}
			};

			return page;
		} catch (t) {
			throw t
		} finally {
			client.end()
		}
	}

}

module.exports = ActionClass;