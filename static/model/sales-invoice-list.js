class PageModel extends BaseListPage {

	constructor() {
		super();

		this.filterData.outstandingOnly = ko.observable(false);
		this.filterData.transDate = ko.observable(null);

		this.entity = 'SalesInvoice';
	}

	// @Override
	async init() {
		await super.init();
		
		const page = this;
		page.filterData.outstandingOnly.subscribe(function () {
			page.search();
		});
	}
}

// var model = new SalesInvoiceList();
// model.init();
// model.beforeBind();
// ko.applyBindings(model);
// model.afterBind();

