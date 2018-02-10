const BaseAction = require('./base');

class ActionClass extends BaseAction {

	async execute() {
		let page = {
			title: 'Daftar Penjualan',
			pageJS: '/static/model/sales-invoice-list.js'
		};

		return page;
	}

}

module.exports = ActionClass;