class CustomerInput extends BaseInputPage {
	constructor() {
		super();
		this.inputData = {
			id: ko.observable(null),
			name: ko.observable(''),
			email: ko.observable(''),
			phone: ko.observable(''),
			fax: ko.observable(''),
			bill_address: ko.observable(''),
			ship_address: ko.observable(''),
			tax_name: ko.observable(''),
			tax_address: ko.observable(''),
			tax_address: ko.observable(''),
			npwp: ko.observable(''),
			nik: ko.observable(''),
			notes: ko.observable(null)
		};

		this.rollingInsert = true;
		this.submitAction = 'customer-save';
		this.listUrl = '/customer-list';
	}

}

var model = new CustomerInput();
model.init();
ko.applyBindings(model);

model.focusOnInput();

