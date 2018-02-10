const dbutil = require('../util/dbutil');
const cnutil = require('../util/cnutil');

async function detailItemDesc(client, salesId) {
	const rs = await client.query(
		'select quantity, item.name ' +
		'from sales_invoice_item ' +
		'left join item on sales_invoice_item.item_id = item.id ' +
		'where master_id = $1', [salesId]);
	if (rs && rs.rows && rs.rows.length) {
		const lines = [];
		for (let index = 0; index < rs.rows.length; index++) {
			if (lines.length >= 2) {
				lines.push('...');
				break;
			}

			const row = rs.rows[index];
			lines.push(`${row.quantity} x ${row.name}`);
		}
		return lines.join('\n');
	}

	return '';
}

module.exports = {
	detailItemDesc
}