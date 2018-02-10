const BaseAction = require('./base');

const dbutil = require('../util/dbutil');

class ActionClass extends BaseAction {

	async execute() {
		const client = dbutil.client();
		await client.connect()
		try {

			let filterData = null;
			if (this.param.filterData) {
				filterData = JSON.parse(this.param.filterData);
			}

			let rs;
			if (filterData && filterData.term) {
				const term = '%' + filterData.term.toUpperCase() + '%'
				rs = await client.query(`SELECT * FROM customer WHERE UPPER(name) LIKE $1 ORDER BY id DESC`, [term]);
			} else {
				rs = await client.query(`SELECT * FROM customer ORDER BY id DESC`);
			}

			const data = rs.rows;

			let page = {
				title: 'Daftar Pelanggan',
				pageJS: '/static/model/customer-list.js',
				backUrl: '/index',
				filterData: filterData,
				contentData: {
					data: data
				},
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