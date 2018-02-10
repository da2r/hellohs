module.exports = {
	table: 'item',
	field: {
		id: {
			type: 'pk',
		},
		name: {
			type: 'text',
			label: 'Nama Barang',
			lookup: true,
			nullable: false
		},
		dept: {
			type: 'text',
			label: 'Departemen',
			defval: 'A',
			lookup: true,
			nullable: false
		},
		note: {
			type: 'text',
			label: 'Catatan'
		}
	}
}