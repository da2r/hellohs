class PageModel {
	constructor() {
		this.definition = {};

		this.defaultInputData = {};

		this.inputData = {
			_operation: ko.observable('INSERT')
		};

		this.entity = 'SalesInvoice';
		this.backUrl = '/';
	}

	async init() {
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

			this.defaultInputData[field.name] = value;
			this.inputData[field.name] = ko.observable(value);
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

			this.defaultInputData[field.name] = value;
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

	async submitInput() {
		try {
			this.validateInput();

			const resp = await sjp.ajaxApi({
				entity: this.entity,
				proc: 'write',
				content: ko.toJSON(this.inputData)
			});

			if (this.isInsert()) {
				sjp.showToast(resp.message || 'Data berhasil disimpan');
				this.resetInput();
			} else {
				window.location.replace(this.backUrl);
			}
		} catch (t) {
			sjp.showError(t, false);
		}
	}

	validateInput() {
		for (let i = 0; i < this.definition.inputList.length; i++) {
			const field = this.definition.inputList[i];
			if (field.nullable === false) {
				const value = this.inputData[field.name]();

				if (sjp.isBlank(value)) {
					let label = field.label || field.name;
					throw `${label} harus diisi`;
				}
			}
		}
	}

	resetInput() {
		console.error('resetInput untested');

		for (let key in this.defaultInputData) {
			this.inputData[key](this.defaultInputData[key]);
		}
	}

	isInsert() {
		return this.inputData._operation() === 'INSERT';
	}

	isEdit() {
		return this.inputData._operation() === 'EDIT';
	}

	abort() {
		console.log('abort');
	}

	beforeBind() {
		console.log('beforeBind');
	}

	afterBind() {
		console.log('afterBind');
	}
}