class BaseInputDialog extends BasePage {

	constructor(owner, el) {
		super();

		this.owner = owner;
		this.el = el;

		this.inputData = null;
		this.defaultData = null;

		this.submitAction = null;

		this.cbFunc = null;

		this.owner.dialogList.push(this);

		this.inserted = null;
	}

	async init() {
		if (this.inputData) {
			this.defaultData = ko.toJS(this.inputData);
		}
	}

	async open(initFunc, cbFunc) {
		if ($.isFunction(initFunc)) {
			initFunc();
		}

		if ($.isFunction(cbFunc)) {
			this.cbFunc = cbFunc;
		}

		this._show();
	}

	clear() {
		const dialog = this;

		sjp.assign(dialog.inputData, dialog.defaultData);
		dialog.inserted = null;
	}

	focusOnInput() {
		setTimeout(() => {
			var $el = this.el.find('input').first();
			if ($el.length > 0) {
				$el[0].focus()
			}
		}, 300);
	}

	validateSubmit() {
		return true;
	}

	getPostParam() {
		return sjp.asPostParam(this.inputData);
	}

	submit() {
		let dialog = this;

		if (!dialog.submitAction) {
			alert('submitAction is not defined');
			throw 'false_submit_action'
		}

		if (dialog.validateSubmit() === false) {
			return;
		}

		sjp.ajaxPost('/api', {
			action: dialog.submitAction,
			postData: dialog.getPostParam()
		}, (data, textStatus, xhr) => {
			if (data.code === 200) {
				dialog.inserted = data.row;
				dialog.close();
			} else {
				sjp.showError(sjp.respMessage(data));
			}
		})
	}

	close() {
		this._hide();
		if ($.isFunction(this.cbFunc)) {
			this.cbFunc(this.inserted);
		}
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

	closeEvent() {
		const dialog = this;
		return function () {
			dialog.close();
		}
	}

}