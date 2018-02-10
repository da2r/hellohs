class BaseInputPage extends BasePage {

	constructor() {
		super();

		this.definition = {};

		this.inputData = {
			_operation: ko.observable('INSERT')
		};

		this.defaultInputData = null;
		this.cleanData = null;

		this.dialogList = [];

		this.entity = null;
		this.submitUrl = '/api';
		this.submitProc = 'write';

		this.backUrl = null;
	}

	// @Override
	async init() {
		super.init();
		
		if (this.entity === null) {
			alert('undefined page model entity!');
			throw 'init failed';
		}

		let resp = await sjp.ajaxApi({
			entity: this.entity,
			proc: 'input',
			content: this.readPageSelector()
		})

		if (sjp.isObject(resp.definition) == false) {
			throw 'Invalid API resp.definition';
		}
		if (sjp.isArray(resp.definition.inputList) == false) {
			throw 'Invalid API resp.definition.inputList';
		}
		resp.data = resp.data || {};

		this._init_response = resp;
		this.definition = resp.definition;

		for (let i = 0; i < resp.definition.inputList.length; i++) {
			const field = resp.definition.inputList[i];

			let value = resp.data[field.name];
			if (value === undefined) {
				value = this.createDefaultValue(field);
			}

			if (field.type === 'pk') {
				if (value === null) {
					this.inputData._operation('INSERT');
				} else {
					this.inputData._operation('EDIT');
				}
			}

			this.createInputData(field, value);
		}

		this.defaultInputData = ko.toJSON(this.inputData);
		this.cleanData = ko.toJSON(this.inputData);

		var pageModel = this; 
		window.onbeforeunload = function (e) {
			const isDirty = ko.toJSON(pageModel.inputData) !== pageModel.cleanData
			if (isDirty) {
				return 'Halaman belum disimpan. Data yang tidak disimpan akan hilang.';
			}

			return null;
		}

		this.initDialog();
	}

	readPageSelector() {
		const url = new URL(window.location.href);

		const id = url.searchParams.get('id');
		if (id) {
			return { id: id };
		}

		const uid = url.searchParams.get('uid');
		if (uid) {
			return { uid: uid };
		}

		const name = url.searchParams.get('name');
		if (name) {
			return { name: name };
		}
	}

	createInputData(field, value) {
		if (field.type === 'pk' || field.type === 'number' || field.type === 'text' ||
			field.type === 'date' || field.type === 'boolean') {

			const inputValue = sjp.asInputValue(value)

			this.inputData[field.name] = ko.observable(inputValue);
		} else if (field.type === 'detail') {
			if (value === null) {
				value = [];
			}

			if (sjp.isArray(value) === false) {
				throw `unsupported detail field "${field.name}" value not array: ${value}`;
			}

			for (let i = 0; i < value.length; i++) {
				const row = value[i];
				if (row._operation === undefined) {
					row._operation = 'EDIT';
				}
			}

			this.inputData[field.name] = ko.observableArray(value);
		} else {
			throw `unsupported field "${field.name}" type "${field.type}"`;
		}
	}

	createDefaultValue(field) {
		if (field.defval !== undefined) {
			return field.defval;
		}

		if (field.type === 'date') {
			return sjp.today();
		}

		if (field.type === 'boolean') {
			return false;
		}

		return null;
	}

	initDialog() {
		for (let index = 0; index < this.dialogList.length; index++) {
			this.dialogList[index].init();
		}
	}

	clear() {
		sjp.assign(this.inputData, JSON.parse(this.defaultInputData));
		this.cleanData = this.defaultInputData;
	}

	isInsert() {
		return this.inputData && this.inputData.id() === null;
	}

	validateSubmit() {
		return true;
	}

	getPostParam() {
		return sjp.asPostParam(this.inputData);
	}

	async submit() {
		let page = this;

		if (page.validateSubmit() === false) {
			return;
		}

		const resp = await sjp.ajaxPost(page.submitUrl, {
			entity: page.entity,
			proc: page.submitProc,
			content: page.getPostParam()
		});

		if (resp.code === 200) {
			if (page.isInsert() && page.rollingInsert) {
				page.clear();

				const message = page.getRespMessage(resp);
				sjp.showToast(message);
				sjp.animateScrollToTop();

				page.focusOnInput();
			} else {
				if (page.viewUrl) {
					sjp.replacePage(page.viewUrl, {
						id: resp.id
					});
				} else {
					sjp.replacePage(page.listUrl);
				}
			}
		} else {
			sjp.showError(sjp.respMessage(resp), false);
		}
	}

	getRespMessage(resp) {
		// return sjp.respMessage(resp);

		if (resp.message) {
			return resp.message;
		} else {
			return 'Data berhasil disimpan';
		}
	}
}