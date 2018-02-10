const BaseAction = require('./base');

class ActionClass extends BaseAction {

	async execute() {
		let data = {
			title: 'Sapta Jaya'
		};

		return data;
	}

}

module.exports = ActionClass;