const cnutil = require('../util/cnutil');
const hs = require('../hs');

const cls = 'SalesInvoice';

async function read(ctx) {
	const {db, content} = ctx;

	return await hs.read(db, cls, content);
}

async function write(ctx) {
	let {db, content} = ctx;

	content.createTime = cnutil.now();

	if (content._operation === 'EDIT') {
		content = await hs.prepareEdit(db, cls, content);
	}

	await recalculate(content);

	return await hs.write(db, cls, content);
}

async function input(ctx) {
	const {db, content} = ctx;

	return await hs.input(db, cls, content);
}

async function list(ctx) {
	const {db, content} = ctx;

	const filter = [];
	if (content.filterData) {
		if (content.filterData.outstandingOnly === true) {
			filter.push({
				key: 'paid',
				value: false
			})
		}

		if (cnutil.isBlank(content.filterData.term) === false) {
			filter.push({
				key: 'lower(sales_invoice.bill_to)',
				operator: 'like',
				value: content.filterData.term.toLowerCase() + '%'
			})
		}

		if (cnutil.isBlank(content.filterData.transDate) === false) {
			filter.push({
				key: 'trans_date',
				value: content.filterData.transDate
			})
		}
	}

	const order = content.order;
	pagination = content.pagination

	return await hs.list(db, cls, filter, order, pagination);
}

async function recalculate(entity) {
	let totalAmount = 0;

	if (Array.isArray(entity.detailItem)) {
		for (let idx = 0; idx < entity.detailItem.length; idx++) {
			const detail = entity.detailItem[idx];

			if (detail._operation !== 'DELETE') {
				detail.amount = detail.quantity * detail.price;

				totalAmount = totalAmount + detail.amount;
			}
		}
	}

	entity.amount = totalAmount;
	entity.payment = await calcPayment(entity);
	entity.owing = entity.amount - entity.payment;
	entity.paid = entity.owing <= 0;
}

async function calcPayment(entity) {
	let result = 0;

	result += entity.downPayment;

	// select sum(amount)from salesPayment where master = entity.id

	return result;
}



module.exports = {
	read,
	write,
	input,
	list
}