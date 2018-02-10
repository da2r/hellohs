class CustomerList extends BaseListPage {

	constructor() {
		super();
		
		this.inputUrl = '/customer-input';
		this.viewUrl = '/customer-view';
	}
}

// var model = {
// 	filter: {
// 		terms: ko.observable(null)
// 	},

// 	search: function () {
// 		sjp.replacePage(location.href, {
// 			filter: ko.toJSON(model.filter)
// 		});
// 	},

// 	insert: function() {
// 		sjp.gotoPage('/customer-input');
// 	},

// 	refresh: function () {
// 		sjp.refreshPage();
// 	},

// 	onClick: function (data) {
// 		sjp.gotoPage('/customer-input', { id: data.id });
// 	}
// }

var model = new CustomerList();
model.init();
model.beforeBind();
ko.applyBindings(model);
model.afterBind();

