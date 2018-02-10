const dbutil = require('../util/dbutil');
const cnutil = require('../util/cnutil');

async function sumAmountBySalesId(client, salesId) {
	const rs = await client.query('select sum(amount) AS amount from sales_payment where master_id = $1', [salesId]);
	if (rs && rs.rows && rs.rows.length) {
		return rs.rows[0].amount;
	}

	return 0;
}

module.exports = {
	sumAmountBySalesId
}