const BaseAction = require('./base');

const dbutil = require('../util/dbutil');
const cnutil = require('../util/cnutil');
const numeral = require('numeral');

class ActionClass extends BaseAction {

	async execute() {
		const client = dbutil.client();
		await client.connect()
		try {
			let year = this.param.year;
			if (cnutil.isBlank(year)) {
				year = (new Date).getFullYear();
			}

			let data = [];

			for (let i = 1; i <= 12; i++) {
				data.push({
					month: i,
					A: 0,
					B: 0,
					total: 0
				});
			}
			
			await this.feed(client, data, '');
			await this.feed(client, data, 'A');
			await this.feed(client, data, 'B');
			

			let page = {
				title: 'Laporan Omset',
				pageJS: '/static/model/report-revenue.js',
				backUrl: '/report-dashboard',
				contentData: {
					reportTitle: 'Omset ' + year,
					reportOption: {
						year: year
					},
					reportData: data
				}
			};

			return page;
		} catch (t) {
			throw t
		} finally {
			client.end()
		}
	}

	find(data, month) {
		for (let i = 0; i < data.length; i++) {
			if (data[i].month == month) {
				return data[i];
			}
		}

		throw 'invalid month ' + month;
	}

	async feed(client, data, dept, year) {
		let rev = await this.getRevenue(client, dept);

		for (let i = 0; i < rev.length; i++) {
			const month = numeral(rev[i].month).value();
			const row = this.find(data, month);
			const amount = numeral(rev[i].amount).value();

			if (dept) {
				row[dept] = amount;
			} else {
				row['total'] = amount;
			}
		}
	}

	async getRevenue(client, dept, year) {
		let sql = `select ` +
			`to_char(s.trans_date, 'MM') as month, sum(d.amount) as amount ` +
			`from sales_invoice_item d ` +
			`inner join sales_invoice s on s.id = d.master_id ` +
			`inner join item i on i.id = d.item_id `;

		if (dept) {
			sql = sql + `where i.dept = '${dept}' `;
		}

		sql = sql + `group by 1 order by 1`
	
		const rs = await client.query(sql);
		const data = rs.rows;

		return data;
	}

}

module.exports = ActionClass;