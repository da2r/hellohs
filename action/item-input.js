const BaseAction = require('./base');

const dbutil = require('../util/dbutil');

class ActionClass extends BaseAction {

	async execute() {
		const client = dbutil.client();
		await client.connect()
		try {
			const id = this.param.id;

			let page = {
				title: 'Barang',
				pageJS: '/static/model/item-input.js',
				backUrl : '/item-list',
				contentData: {
					data: await dbutil.getById(client, 'item', id)
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