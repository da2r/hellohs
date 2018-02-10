const BaseApi = require('./base');
const dbutil = require('../util/dbutil');
const cnutil = require('../util/cnutil');
const numeral = require('numeral');

class Class extends BaseApi {

	async execute() {
		const client = dbutil.client();
		await client.connect()
		try {
			await client.query('BEGIN')

			const resultId = await this.writeSales(client);

			for (let index = 0; index < this.param.detailItem.length; index++) {
				const det = this.param.detailItem[index];
				if (det._status === 'delete') {
					await dbutil.delet(client, 'sales_invoice_item', det.id);
				} else {
					const detailData = await this.readDetailItemParam(client, resultId, det);
					await dbutil.save(client, 'sales_invoice_item', detailData);
				}
			}

			await client.query('COMMIT')

			return {
				code: 200,
				message: 'Penjualan berhasil disimpan',
				id: resultId
			};
		} catch (t) {
			await client.query('ROLLBACK')
			throw t
		} finally {
			client.end()
		}
	}

	async writeSales(client) {
		const param = this.param;

		console.log(param.id);

		let entity;
		if (param.id) {
			entity = await dbutil.lockById(client, 'sales_invoice', param.id);
		} else {
			entity = {
				create_time: dbutil.now(),
				owing: 0,
				paid: 0,
				outstanding: false,
			};
		}

		entity.trans_date = param.trans_date;
		entity.cash = cnutil.asBoolean(param.cash);
		entity.notes = param.notes;

		let amount = 0;
		for (let index = 0; index < param.detailItem.length; index++) {
			const detail = param.detailItem[index];
			amount += +detail.amount;
		}
		entity.amount = amount;

		if (entity.cash) {
			entity.bill_to = '';
			entity.phone = '';
			entity.down_payment = amount;
			entity.owing = 0;
			entity.paid = amount;
			entity.outstanding = false;
		} else {
			entity.bill_to = param.bill_to;
			entity.phone = param.phone;
			entity.down_payment = numeral(param.down_payment || 0).value();
			entity.owing = amount;
			entity.paid = 0;

			if (entity.down_payment) {
				entity.paid += entity.down_payment;
				entity.owing -= entity.down_payment;
			}

			if (entity.id) {
				const salesPaymentService = require('../service/sales-payment-service');
				let payment = await salesPaymentService.sumAmountBySalesId(client, entity.id);

				entity.paid += payment;
				entity.owing -= payment;
			}

			if (entity.owing < 0) {
				entity.owing = 0;
			}

			entity.outstanding = entity.owing === 0;
		}

		if (cnutil.isBlank(entity.trans_date)) {
			throw 'Tanggal harus diisi';
		}

		if (!entity.cash) {
			if (cnutil.isBlank(entity.bill_to)) {
				throw 'Nama pembeli harus diisi';
			}
			if (cnutil.isBlank(entity.phone)) {
				throw 'Nomor Telpon Pembeli harus diisi';
			}
		}

		if (amount === 0) {
			throw 'Penjualan harus memiliki nilai';
		}

		const resultId = await dbutil.save(client, 'sales_invoice', entity)
		return resultId;
	}

	async readDetailItemParam(client, salesId, detailParam) {
		let result = {
			master_id: salesId,
			item_id: detailParam.item.id,
			quantity: detailParam.quantity,
			amount: detailParam.amount
		}

		if (detailParam.id) {
			result.id = detailParam.id
		}

		return result;
	}
}



module.exports = Class;