class ItemList extends BaseListPage {

	constructor() {
		super();

		this.filterData.outstandingOnly = ko.observable(false);

		this.inputUrl = '/item-input';
		this.viewUrl = '/item-input';
	}

	init() {
		super.init();
	}
}

var model = new ItemList();
model.init();
model.beforeBind();
ko.applyBindings(model);
model.afterBind();


