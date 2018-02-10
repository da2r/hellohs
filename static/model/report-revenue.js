class ReportRevenue extends BasePage {

	constructor() {
		super();

	}

	init() {
		super.init();
	}
}

var model = new ReportRevenue();
model.init();
model.beforeBind();
ko.applyBindings(model);
model.afterBind();


