class BaseApi {

	init(param, req, res) {
		this.param = param;
		this.req = req;
		this.res = res;
	}

	async execute() {
		// Abstract
		throw 'execute() not implemented';
	}
}

module.exports = BaseApi;