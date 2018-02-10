const pg = require('pg');
const moment = require('moment');

const dbutil = require('./util/dbutil')
const hs = require('./hs');


async function main() {
	console.log('start..');

	const db = dbutil.client();
	await db.connect()
	try {
		await db.query('BEGIN')

		// const id = await hs.write(db, 'SalesInvoice', {
		// 	_operation: 'INSERT',
		// 	transDate: '2018-01-28',
		// 	createTime: '2018-01-28 08:20:12',
		// 	cash: true,
		// 	billTo: '',
		// 	phone: '',
		// 	note: '',
		// 	amount: 40000,
		// 	downPayment: 40000,
		// 	owing: 0,
		// 	payment: 40000,
		// 	paid: true,
		// 	detailItem: [{
		// 		_operation: 'INSERT',
		// 		item: {
		// 			id: 1,
		// 		},
		// 		quantity: 8,
		// 		price: 5000,
		// 		amount: 40000
		// 	}]
		// })

		// console.log(id);

		// const x = await hs.read(db, 'SalesInvoice', {
		// 	id: 17
		// }, 'INPUT');
		// console.log(JSON.stringify(x, null, 2));

		// await hs.write(db, 'Item', {
		// 	_operation : 'DELETE',
		// 	id : id
		// });

		// const input = await hs.input(db, 'SalesInvoiceItem', {
		// 	id: 1
		// });
		// console.log(input);

		await devSalesInvoice(db);

		await db.query('COMMIT')

	} catch (t) {
		await db.query('ROLLBACK')
		throw t
	} finally {
		db.end()
	}
}

async function devSalesInvoice(db) {
	let postData = {
		_operation: 'EDIT',
		id: 29,
		transDate: '2018-01-28',
		cash: true,
		billTo: '',
		phone: '',
		note: 'bla bla notes',
		// downPayment: 40000,
		detailItem: [{
			_operation: 'INSERT',
			item: {
				id: 1,
			},
			quantity: 8,
			price: 5000,
		}]
	};

	const service = hs.getService('SalesInvoice');
	const id = await service.write({
		db: db,
		content: postData
	});

	console.log(id);
}

main().catch((a, b) => {
	console.log('errr');
	console.error(a);
	console.error(b);
});