class BaseDetailDialog extends BasePage {

	constructor(owner, el) {
		super();

		this.owner = owner;
		this.el = el;

		this.inputData = null;
		this.defaultData = null;

		this._data = null;
		this._loaded = false;
		this._deleted = false;

		this.isEditing = ko.observable(false);

		this.owner.dialogList.push(this);
	}

	async init() {
		if (this.inputData) {
			this.defaultData = ko.toJS(this.inputData);
		}
	}

	clear() {
		sjp.assign(this.inputData, this.defaultData);

		this._data = null;
		this._loaded = false;
		this._deleted = false;

		this.isEditing(false);
	}

	focusOnInput() {
		setTimeout(() => {
			var $el = this.el.find('input').first();
			if ($el.length > 0) {
				$el[0].focus()
			}
		}, 300);
	}

	hasId() {
		return this.inputData && ko.unwrap(this.inputData.id);
	}

	isLoaded() {
		return this._loaded;
	}

	// @abstract
	async onOpen(data) {
		alert('onOpen is not implemented');
		// throw 'not_implemented'
	}

	// @abstract
	async onSubmit() {
		alert('onSubmit is not implemented');
		throw 'not_implemented'
	}

	// @abstract
	async onDelete() {
		alert('onDelete is not implemented');
		throw 'not_implemented'
	}

	async open(data, initFunc) {
		this.clear();

		if ($.isFunction(initFunc)) {
			initFunc();
		}

		if (data) {
			this._data = data;
			this.isEditing(true);
		}

		await this.onOpen(data);

		this._show();
		this._loaded = true;
	}

	async submit() {
		await this.onSubmit();
		this.close();
	}

	async delete() {
		this._deleted = true;

		await this.onDelete();
		this.close();
	}

	close() {
		this._hide();
		this.clear();
	}

	_hide() {
		this.el.modal('hide');
	}

	_show() {
		this.el.modal({
			backdrop: 'static'
		});

		this.focusOnInput();
	}

	assignData() {

	}

	resultData() {
		const dialog = this;
		if (dialog._deleted) {
			const result = {}
			if (dialog.hasId()) {
				result.id = dialog.inputData.id();
			}

			result._operation = 'DELETE';

			return result;
		} else {
			const result = ko.toJS(dialog.inputData);

			if (dialog.hasId()) {
				result._operation = 'EDIT';
			} else {
				result._operation = 'INSERT';
			}

			return result;
		}
	}

	pushToDetail(detailObs) {
		const dialog = this;

		const res = dialog.resultData();

		let idx = -1;
		if (dialog._data) {
			idx = detailObs.indexOf(dialog._data);
		}

		if (idx > -1) {
			detailObs()[idx] = res;
			detailObs.valueHasMutated();
		} else {
			detailObs.push(res);
		}
	}

	deleteFromDetail(detailObs) {
		const dialog = this;

		let idx = detailObs.indexOf(dialog._data);
		if (idx === -1) {
			console.error('Cannot find matching deleted data on detailObs');
			return
		}

		if (dialog._data.id) {
			detailObs()[idx]._status = 'delete';
			detailObs.valueHasMutated();
		} else {
			detailObs.splice(idx, 1);
		}
	}

	openEvent() {
		const dialog = this;

		return function (d) {
			dialog.open(d);
		}
	}

	submitEvent() {
		const dialog = this;
		return function () {
			dialog.submit();
		}
	}

	deleteEvent() {
		const dialog = this;
		return function () {
			dialog.delete();
		}
	}

	closeEvent() {
		const dialog = this;
		return function () {
			dialog.close();
		}
	}

}