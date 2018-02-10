module.exports = {
	table: 'sales_invoice',
	field: {
		id: {
			type: 'pk',
		},
		transDate: {
			type: 'date',
			column: 'trans_date',
			label: 'Tanggal',
			nullable: false
		},
		createTime: {
			type: 'date',
			column: 'create_time',
			label: 'Tgl. Input',
			input: false
		},
		cash: {
			type: 'boolean',
			label: 'Catatan',
			defval: true
		},
		billTo : {
			type: 'text',
			column: 'bill_to',
			label: 'Kepada'
		},
		phone: {
			type: 'text',
			label: 'No. Telp'
		},
		note: {
			type: 'text',
			label: 'Catatan'
		},
		amount: {
			type: 'number',
			label: 'Nilai',
			input: false
		},
		downPayment: {
			type: 'number',
			column: 'down_payment',
			label: 'Uang Muka',
			defval: 0
		},
		owing: {
			type: 'number',
			label: 'Piutang',
			input: false
		},
		payment: {
			type: 'number',
			label: 'Terbayar',
			input: false
		},
		paid: {
			type: 'boolean',
			label: 'Lunas',
			input: false
		},

		detailItem: {
			type: 'detail',
			label: 'Rincian Barang',
			detailEntity: 'SalesInvoiceItem'
		}
	}
}