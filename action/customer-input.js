const BaseAction = require('./base');

const dbutil = require('../util/dbutil');

class ActionClass extends BaseAction {

	async execute() {
		const client = dbutil.client();
		await client.connect()
		try {
			const id = this.param.id;

			let page = {
				title: 'Pelanggan',
				pageJS: '/static/model/customer-input.js',
				backUrl : '/customer-list',
				showSubmitButton: true,
				contentData: {
					data: await dbutil.getById(client, 'customer', id)
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