const hs = require('../hs');

const cls = 'Item';

async function read(ctx) {
	const {db, content} = ctx;

	return await hs.read(db, cls, content);
}

async function write(ctx) {
	const {db, content} = ctx;

	return await hs.write(db, cls, content);
}

async function input(ctx) {
	const {db, content} = ctx;

	return await hs.input(db, cls, content);
}

module.exports = {
	read,
	write,
	input
}