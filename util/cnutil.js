const moment = require('moment');

function isBlank(value) {
	if (value === undefined || value === null || value === '') {
		return true;
	}

	return false;
}

function isZero(value) {
	if (isBlank(value)) {
		return true;
	}

	if (value == 0) {
		return true;
	}

	return false;
}

function isJSON(value) {
	if (typeof value === 'string') {
		if (value[0] === '{' || value[0] === '[') {
			const end = value[value.length - 1]
			return end === '}' || end === ']';
		}
	}

	return false;
}

function asBoolean(value) {
	if (typeof value === 'boolean') {
		return value;
	}

	if (typeof value === 'string') {
		if (value == 'true') {
			return true;
		} else if (value == 'false') {
			return false;
		} else {
			return null;
		}
	}

	if (typeof value == 'number') {
		return value == 1;
	}

	return !!value;
}

function today() {
	return moment().format('YYYY-MM-DD');
}

function now() {
	return moment().format('YYYY-MM-DD HH:mm:ss');
}

function errorMessage(t) {
	if (t) {
		if (typeof t === 'object') {
			if (t.message) {
				return t.message;
			} else {
				return JSON.stringify(t);
			}
		} else {
			return t;
		}
	} else {
		return 'No specific error message';
	}
}

module.exports = {
	isBlank,
	isZero,
	isJSON,

	asBoolean,

	today,
	now,

	errorMessage
}