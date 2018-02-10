class BaseSelectDialog extends BasePage {

	constructor(owner, el) {
		super();

		this.owner = owner;
		this.el = el;

		this.cbFunc = null;

		this.owner.dialogList.push(this);

		this.term = ko.observable('');
		this.results = ko.observableArray();

		this.selected = null;

		this.isLoading = ko.observable(false);

		this._internal = false;

		this._term = '';
		this._fetchTimer = null;
	}

	init() {
		const dialog = this;

		dialog.term.subscribe(function (newValue) {
			dialog.changeTerm(ko.unwrap(dialog.term));
		});
	}

	changeTerm(value) {
		const dialog = this;

		dialog._term = value;

		if (dialog._fetchTimer) {
			clearTimeout(dialog._fetchTimer);
		}

		if (!dialog._internal) {
			dialog._fetchTimer = setTimeout(function () {
				dialog.fetchResults();
			}, 500);
		}
	}

	async fetchResults() {
		const dialog = this;

		dialog.isLoading(true);

		var config = {
			method: 'GET',
			dataType: 'json',
			data: {
				term: dialog._term
			}
		};

		config.success = function (data, statusText, xhr) {
			if (dialog._internal) {
				return;
			}

			if (data.code === 200) {
				if (data.term === dialog._term) {
					dialog.results(data.results);
				} else {
					dialog.fetchResults();
				}
			}
		};

		config.complete = function (xhr) {
			// setTimeout(function() {
			dialog.isLoading(false);
			// }, 1000);
		};

		config.error = function (xhr) {
			alert('There was a problem connecting to the server, please try again..');
		};

		$.ajax(dialog.selectUrl, config);
	}

	async open(initFunc, cbFunc) {
		if ($.isFunction(initFunc)) {
			initFunc();
		}

		if ($.isFunction(cbFunc)) {
			this.cbFunc = cbFunc;
		}

		this._show();

		this.fetchResults();
	}

	clear() {
		const dialog = this;

		dialog._internal = true;
		try {
			dialog.selected = null;

			dialog.term('');
			dialog.results([]);
			dialog.isLoading(false);
			clearTimeout(dialog._fetchTimer);
		} finally {
			dialog._internal = false;
		}
	}

	focusOnInput() {
		setTimeout(() => {
			var $el = this.el.find('input').first();
			if ($el.length > 0) {
				$el[0].focus()
			}
		}, 300);
	}

	close() {
		this._hide();
		if ($.isFunction(this.cbFunc)) {
			var sel = this.selected;
			if (sel && sel.data) {
				sel = sel.data;
			}

			this.cbFunc(sel);
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

	inputNewData() {
		alert('inputNewData not implemented');
	}

	setSelected(data) {
		this.selected = data;
		this.close();
	}

	openEvent() {
		const dialog = this;

		return function (d) {
			dialog.open(d);
		}
	}

	closeEvent() {
		const dialog = this;
		return function () {
			dialog.close();
		}
	}

	inputNewDataEvent() {
		const dialog = this;
		return function (data) {
			dialog.inputNewData(data);
		}
	}

	setSelectedEvent() {
		const dialog = this;
		return function (data) {
			dialog.setSelected(data);
		}
	}

}