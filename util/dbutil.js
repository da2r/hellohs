const pg = require('pg');
const moment = require('moment');

pg.types.setTypeParser(1082, 'text', function (val) {
	return moment(val);
});

pg.types.setTypeParser(1114, 'text', function (val) {
	return moment(val);
});

moment.fn.toJSON = function () {
	const hour = this.hour();
	const min = this.minute();
	const sec = this.second();
	const ms = this.millisecond();

	if (hour === 0 && min === 0 && sec === 0 && ms === 0) {
		return this.format('YYYY-MM-DD');
	} else {
		return this.format('YYYY-MM-DD HH:mm:ss');
	}
}

function rootclient() {
	const client = new pg.Client({
		user: 'postgres',
		host: '127.0.0.1',
		database: 'postgres',
		password: 'admin',
		port: 5432,
	});
	return client;
}

function client() {
	const client = new pg.Client({
		user: 'postgres',
		host: '127.0.0.1',
		database: 'sjpda',
		password: 'admin',
		port: 5432,
	});
	return client;
}

async function save(client, table, data) {
	if (data.id) {
		return update(client, table, data.id, data);
	} else {
		const ins = Object.assign({}, data);
		delete ins.id;

		return insert(client, table, ins);
	}
}

async function insert(client, table, data) {
	const sql = queryInsert(table, data);
	const rs = await client.query(sql, asParam(data));
	return rs.rows[0].id;
}

async function update(client, table, id, data) {
	const sql = queryUpdate(table, id, data);
	await client.query(sql, asParam(data));
	return id;
}

async function delet(client, table, id) {
	const sql = queryDelete(table);
	await client.query(sql, [id]);
	return id;
}

function asParam(fields) {
	return Object.values(fields);
}

function queryInsert(table, fields) {
	// INSERT INTO Customers (CustomerName, ContactName, Address, City, PostalCode, Country)
	// VALUES ('Cardinal', 'Tom B. Erichsen', 'Skagen 21', 'Stavanger', '4006', 'Norway');

	let result = '';
	result += 'INSERT INTO ';
	result += table;
	result += ' (';
	result += asInsertNames(fields);
	result += ') VALUES (';
	result += asParamExp(fields);
	result += ') RETURNING id;';

	return result;
}

function queryUpdate(table, id, fields) {
	// UPDATE Customers
	// SET ContactName = 'Alfred Schmidt', City= 'Frankfurt'
	// WHERE CustomerID = 1;

	if (!Number.isInteger(+id)) {
		throw 'malformed update id';
	}

	let result = '';
	result += 'UPDATE ';
	result += table;
	result += ' SET ';
	result += asUpdateParamExp(fields);
	result += ' WHERE id = ';
	result += id;

	return result;
}

function queryDelete(table) {
	return `DELETE FROM ${table} WHERE id = $1`;
}

function asInsertNames(fields) {
	return Object.keys(fields).join(', ');
}

function asParamExp(fields) {
	const count = Object.keys(fields).length;

	let result = []
	for (let idx = 1; idx <= count; idx++) {
		result.push('$' + idx);
	}

	return result.join(', ');
}

function asUpdateParamExp(fields) {
	let keys = Object.keys(fields)
	const len = keys.length;
	for (let i = 0; i < len; i++) {
		keys[i] = keys[i] + ' = $' + (i + 1);
	}
	return keys.join(', ');
}

async function lockById(client, table, id) {
	return await lockByField(client, table, 'id', id);
}

async function lockByField(client, table, filter, value) {
	const rs = await client.query(`SELECT id FROM ${table} WHERE ${table}.${filter} = $1 FOR NO KEY UPDATE`, [value]);
	return rs.rowCount;
}

async function selectById(client, table, id) {
	const result = await getById(client, table, id)
	if (result === null) {
		throw 'Data tidak ditemukan atau sudah dihapus';
	}

	return result;
}

async function getById(client, table, id) {
	if (id === undefined || id === null) {
		return null;
	}

	return await getOne(client, table, 'id', id);
}

async function getOne(client, table, field, param) {
	const rs = await client.query(`SELECT * FROM ${table} WHERE ${field} = $1`, [param]);
	if (rs.rows && rs.rows.length > 0) {
		return rs.rows[0];
	} else {
		return null;
	}
}

async function exists(client, table, field, param) {
	const rs = await client.query(`SELECT 1 FROM ${table} WHERE ${field} = $1`, [param.trim()]);
	if (rs.rows && rs.rows.length > 0) {
		return true;
	} else {
		return false;
	}
}

async function existsIC(client, table, field, param) {
	const rs = await client.query(`SELECT 1 FROM ${table} WHERE Upper(${field}) = $1`, [param.trim().toUpperCase()]);
	if (rs.rows && rs.rows.length > 0) {
		return true;
	} else {
		return false;
	}
}

function today() {
	return moment().format('YYYY-MM-DD');
}

function now() {
	return moment().format('YYYY-MM-DD HH:mm:ss');
}

module.exports = {
	rootclient,
	client,
	save,
	insert,
	update,
	delet,
	lockById,
	lockByField,
	selectById,
	getById,
	getOne,
	exists,
	existsIC,
	today,
	now,
}