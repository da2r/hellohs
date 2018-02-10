const BaseAction = require('./base');

class ActionClass extends BaseAction {

	async execute() {
		let page = {
			title: 'Penjualan',
			pageJS: '/static/model/sales-invoice-view.js'
		};

		return page;
	}

}

module.exports = ActionClass;