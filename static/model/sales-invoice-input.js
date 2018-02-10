class PageModel extends BaseInputPage {
	constructor() {
		super();

		this.entity = 'SalesInvoice';

		this.itemDialog = new ItemDialog(this, $('#item-dialog'));
		this.selectItemDialog = new SelectItemDialog(this, $('#select-item-dialog'));
		this.inputItemDialog = new InputItemDialog(this, $('#input-item-dialog'));

		this.rollingInsert = true;
		this.listUrl = '/sales-invoice-list';
	}

	async init() {
		await super.init();

		this.owing = ko.computed(() => {
			let amount = numeral(sjp.detailAmountSum(model.inputData.detailItem));

			let dp = model.inputData.downPayment();
			if (!dp) {
				dp = 0;
			}

			let result = amount.subtract(dp);

			return result.value();
		});

		this.filteredDetailItem = ko.computed(function() {
			return sjp.filterDeleted(model.inputData.detailItem);
		})
	}

	getPostParam() {
		let result = super.getPostParam();
		return result;
	}

	validateSubmit() {
		if (model.inputData.detailItem().length == 0) {
			sjp.showError('Rincian Barang belum dimasukkan');
			return false;
		}

		if (model.inputData.cash() === '') {
			sjp.showError('Pembayaran belum dipilih');
			return false;
		}

		if (!sjp.asBoolean(model.inputData.cash())) {
			if (sjp.isBlank(model.inputData.billTo())) {
				sjp.showError('Nama Pembeli tidak boleh kosong');
				return false;
			}

			if (sjp.isBlank(model.inputData.phone())) {
				sjp.showError('No. Telpon Pembeli tidak boleh kosong');
				return false;
			}
		}
	}

	focusOnInput() {

	}

	openSelectItemDialog() {
		var afterSelect = function (selected) {
			if (selected) {
				model.itemDialog.open(null, function () {
					model.itemDialog.inputData.item(selected);
				})
			}
		};
		model.selectItemDialog.open(null, afterSelect);
	}

	openItemDialog() {
		model.itemDialog.open(null);
	}

}


class ItemDialog extends BaseDetailDialog {

	constructor(owner, el) {
		super(owner, el);

		const dialog = this;

		dialog.inputData = {
			id: ko.observable(null),
			item: ko.observable(null),
			quantity: ko.observable(1),
			price: ko.observable(0)
		}

		dialog.amount = ko.computed(function() {
			return dialog.inputData.quantity() * dialog.inputData.price();
		});
	}

	onOpen(data) {
		sjp.assign(this.inputData, data);
	}

	onSubmit() {
		console.log('pushToDetail');
		model.itemDialog.pushToDetail(model.inputData.detailItem);
	}

	onDelete() {
		model.itemDialog.deleteFromDetail(model.inputData.detailItem);
	}

	selectItem() {
		model.itemDialog._hide();
		model.selectItemDialog.open(null, function (selected) {
			if (selected) {
				model.itemDialog.inputData.item(selected);
			}
			model.itemDialog._show();
		});
	}

}

class SelectItemDialog extends BaseSelectDialog {

	constructor(owner, el) {
		super(owner, el);

		this.selectUrl = '/select/item-select';
	}

	inputNewData() {
		var isEditing = model.itemDialog.isLoaded();
		model.selectItemDialog._hide();

		var beforeShow = function () {
			model.inputItemDialog.inputData.name(model.selectItemDialog.term());
		}

		var afterInsert = function () {
			if (isEditing) {
				if (model.inputItemDialog.inserted) {
					model.itemDialog.inputData.item(model.inputItemDialog.inserted);
				}
				model.itemDialog._show();
			} else {
				if (model.inputItemDialog.inserted) {
					model.itemDialog.open(null, function () {
						model.itemDialog.inputData.item(model.inputItemDialog.inserted);
					})
				}
			}
		}

		model.inputItemDialog.open(beforeShow, afterInsert);
	}
}

class InputItemDialog extends BaseInputDialog {
	constructor(owner, el) {
		super(owner, el);

		this.inputData = {
			name: ko.observable(''),
			dept: ko.observable(''),
			notes: ko.observable('')
		}

		this.submitAction = 'item-save';
	}
}

// var model = new SalesInvoiceInput();
// model.init();
// sjp.showPageBody();
// ko.applyBindings(model);

// model.focusOnInput();

