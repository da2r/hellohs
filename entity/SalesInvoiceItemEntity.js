module.exports = {
	table: 'sales_invoice_item',
	field: {
		id: {
			type: 'pk',
		},
		master: {
			type: 'master',
			column: 'master_id',
			label: 'Penjualan',
		},
		item: {
			type: 'lookup',
			column: 'item_id',
			label: 'Barang',
			lookupEntity: 'Item'
		},
		quantity: {
			type: 'number',
			label: 'Jumlah',
			defval: 1
		},
		price : {
			type: 'number',
			label: 'Harga'
		},
		amount: {
			type: 'number',
			label: 'Nilai',
			input: false
		}

	}
}