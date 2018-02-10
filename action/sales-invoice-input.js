const BaseAction = require('./base');

const dbutil = require('../util/dbutil');

class ActionClass extends BaseAction {

	async execute() {
		const client = dbutil.client();
		await client.connect()
		try {
			const id = this.param.id;

			let page = {
				title: 'Penjualan',
				pageJS: '/static/model/sales-invoice-input.js',
				backUrl : '/sales-invoice-list',
				showSubmitButton: true,
				contentData: {
					data: await dbutil.getById(client, 'sales_invoice', id)
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