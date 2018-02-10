class BaseAction {

	init(doc, req, res) {
		this.doc = doc
		this.req = req;
		this.res = res;

		if (req.method === 'GET') {
			this.param = req.query;
		} else {
			this.param = req.body;
		}
	}

	getLayout() {
		return 'default';
	}

	async execute() {
		// Abstract
		throw 'execute() not implemented';
	}

	async doExecute() {
		const data = await this.execute()
		this.renderOutput(data);
	}

	renderOutput(data) {
		if (data) {
			const options = {
				layout: this.getLayout(),
				context: data
			}
			this.res.render(this.doc, options);
		} else {
			this.res.render(this.doc, {
				layout: '500'
			});
		}
	}
}

module.exports = BaseAction;