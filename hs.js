const cnutil = require('./util/cnutil');
const dbutil = require('./util/dbutil');

const MODE = ['LOOKUP', 'LIST', 'INPUT', 'DETAIL'];

const DEF_PAGE_SIZE = 10;	//20;

async function read(db, cls, crit, mode) {
	const def = getDefinition(cls);

	if (crit.id) {
		const filter = [{
			key: 'id',
			value: crit.id
		}];
		return doRead(db, def, filter, null, null, true, mode);
	}

	throw 'read procedure missing id or uid!';
}

async function readList(db, cls, crit, mode) {
	const def = getDefinition(cls);

	if (crit.master) {
		const filter = [{
			key : 'master_id',
			value: crit.master
		}];
		return doRead(db, def, filter, null, null, false, mode);
	}

	throw 'readList procedure missing criteria!';
}

async function doRead(db, def, filter, order, paging, single, mode) {
	if (mode === undefined) {
		mode = 'DETAIL';
	}

	if (MODE.indexOf(mode) === -1) {
		throw 'unknown read mode ' + mode;
	}

	if (mode === 'INPUT') {
		await dbutil.lockByField(db, def.table, filter.key, filter.value);
	}

	const column = columnSelect(def, mode);
	const from = columnFrom(def, mode);

	let sql = `select ${column.join(', ')} from ${from}`;
	let param = [];

	if (Array.isArray(filter) && filter.length > 0) {
		let where = whereFilter(def, filter, param);
		sql = sql + ` where ${where}`;
	}

	if (order) {
		if (order.desc === true) {
			sql = sql + ` order by ${order.key} desc`;
		} else {
			sql = sql + ` order by ${order.key}`;
		}
	} else {
		sql = sql + ` order by id desc`;
	}

	if (paging) {
		let page = paging.page || 1;
		if (page < 1) {
			page = 1;
		}

		let pageSize = paging.pageSize || DEF_PAGE_SIZE;
		if (pageSize < 1) {
			pageSize = DEF_PAGE_SIZE;
		}

		let limit = pageSize;
		let offset = (page - 1) * pageSize;
		sql = sql + ` limit ${limit} offset ${offset}`;
	}

	// console.log(sql);
	// console.log(param);

	const rs = await db.query(sql, param);
	if (single) {
		if (rs.rows.length === 0) {
			return null;
		}

		let result = await wrapResult(db, rs.rows[0], def, mode);


		if (mode === 'DETAIL' || mode === 'INPUT') {
			const detailField = getDetailFieldList(def);

			for (let idx = 0; idx < detailField.length; idx++) {
				const f = detailField[idx];

				result[f.key] = await readList(db, f.detailEntity, {
					master: result.id
				}, mode)
			}
		}

		return result;
	} else {
		let result = [];
		for (let i = 0; i < rs.rows.length; i++) {
			const row = rs.rows[i];
			result.push(await wrapResult(db, row, def, mode));
		}
		return result;
	}
}

function columnSelect(def, mode, tableAlias, columnPrefix) {
	tableAlias = tableAlias || def.table;

	const result = [];

	for (let key in def.field) {
		const f = def.field[key];

		if (f.data === false || f.type === 'detail') {
			continue;
		}

		if (filterMode(f, mode) === false) {
			continue;
		}

		let column = key;
		if (f.column) {
			column = f.column;
		}

		let columnAlias = column;
		if (columnPrefix) {
			columnAlias = columnPrefix + '__' + column;
		}

		if (f.type === 'lookup') {
			const lookup = getDefinition(f.lookupEntity);

			const join = columnSelect(lookup, 'LOOKUP', asLookupAlias(column), columnAlias);
			result.push(...join);
		} else {
			result.push(`${tableAlias}.${column} AS ${columnAlias}`);
		}
	}

	return result;
}

function columnFrom(def, mode) {
	let result = def.table;

	for (let key in def.field) {
		const f = def.field[key];

		if (f.data === false) {
			continue;
		}

		if (f.type === 'lookup' && filterMode(f, mode)) {
			const lookup = getDefinition(f.lookupEntity);
			const column = f.column ? f.column : key;
			const lookupAlias = asLookupAlias(column, f);

			let join = `left join ${lookup.table} AS ${lookupAlias} on ${def.table}.${column} = ${lookupAlias}.id`;
			result = result + ' ' + join;
		}
	}

	return result;
}

function whereFilter(def, filter, param) {
	let where = [];
	for (let i = 0; i < filter.length; i++) {
		const f = filter[i];

		const op = f.operator || '=';
		if (f.key.indexOf('.') > -1) {
			where.push(`${f.key} ${op} $${where.length + 1}`);
		} else {
			where.push(`${def.table}.${f.key} ${op} $${where.length + 1}`);
		}

		param.push(f.value);
	}

	return where.join(' and ');
}

async function wrapResult(db, row, def, mode) {
	const result = {};

	for (let key in def.field) {
		const f = def.field[key];

		if (filterMode(f, mode) === false) {
			continue;
		}

		let c = key;
		if (f.column) {
			c = f.column;
		}

		if (f.type === 'lookup') {
			const obj = {};

			const lookupEntity = getDefinition(f.lookupEntity);
			const lookupList = getLookupList(lookupEntity);
			for (let i = 0; i < lookupList.length; i++) {
				const lookup = lookupList[i];
				const val = row[c + '__' + lookup.column]
				obj[lookup.key] = val;
			}

			result[key] = obj;
		} else {
			result[key] = row[c];
		}
	}

	return result;
}

function filterMode(field, mode) {
	if (mode === 'DETAIL' || field.type === 'pk') {
		return true;
	}

	if (mode === 'LOOKUP') {
		return field.lookup === true;
	}

	if (mode === 'LIST') {
		if (field.type === 'lookup') {
			return field.list === true;
		}

		if (field.type === 'detail') {
			return false;
		}

		return true;
	}

	if (mode === 'INPUT') {
		return field.input !== false;
	}

	return false;
}

function asLookupAlias(column) {
	return column + '__lookup';
}

function getLookupList(def) {
	const result = [];

	for (let key in def.field) {
		const f = def.field[key];

		if (filterMode(f, 'LOOKUP')) {
			let c = key;
			if (f.column) {
				c = f.column;
			}

			result.push({
				key: key,
				column: c
			});
		}
	}

	return result;
}

async function write(db, cls, data) {
	const def = getDefinition(cls);

	const op = data._operation;

	if (op === 'INSERT' || op === 'EDIT') {
		// yg brwose apa perlu jg seperti edit ?
		return await insertedit(db, def, data);
	} else if (op === 'DELETE') {
		return await delet(db, def, data);
	}
}

async function insertedit(db, def, data) {
	const op = data._operation;
	const table = def.table;

	let row = {};
	for (let key in def.field) {
		const f = def.field[key];

		if (f.type === 'pk' || f.type === 'detail' || f.data === false) {
			continue;
		}

		let v = data[key];
		if (v === undefined) {
			throw 'missing value for field ' + key;
		}
		v = extractValue(v, f);

		let c = key;
		if (f.column) {
			c = f.column;
		}

		row[c] = v;
	}

	let result;
	if (op === 'INSERT') {
		result = await dbutil.insert(db, table, row);
	} else if (op === 'EDIT') {
		result = await dbutil.update(db, def.table, data.id, row);
	}


	const detailFieldList = getDetailFieldList(def);
	for (let idxDetField = 0; idxDetField < detailFieldList.length; idxDetField++) {
		const detailField = detailFieldList[idxDetField];

		const detailEntity = detailField.detailEntity;
		const detailDataList = data[detailField.key];
		for (let idx = 0; idx < detailDataList.length; idx++) {
			const detailData = detailDataList[idx];

			assignMasterFieldData(detailEntity, detailData, result);
			await write(db, detailEntity, detailData);
		}
	}

	return result;
}

function extractValue(value, field) {
	if (field.type === 'number') {
		if (value === null) {
			return 0;
		}

		if (typeof value === 'string') {
			return parseInt(value, 10);
		}
	}

	if (field.type === 'master' || field.type === 'lookup') {
		if (value === null) {
			return null;
		}

		if (value && value.id) {
			return value.id;
		}

		if (typeof value === 'string') {
			return parseInt(value, 10);
		}
	}

	return value;
}


function getDetailFieldList(def) {
	const result = [];

	for (let key in def.field) {
		const f = def.field[key];

		if (f.type === 'detail') {
			result.push({
				key: key,
				column: f.column,
				label: f.label,
				detailEntity: f.detailEntity,
				type: f.type
			});
		}
	}

	return result;
}

function assignMasterFieldData(cls, row, masterId) {
	row.master = masterId;
}

async function delet(db, def, data) {
	return await dbutil.delet(db, def.table, data.id);
}

async function input(db, cls, crit) {
	const def = getDefinition(cls);

	const result = {
		definition: {
			inputList: definitionInputList(def)
		}
	};

	if (crit) {
		result.data = await read(db, cls, crit, 'INPUT');
	}

	return result;
}

function definitionInputList(def) {
	const result = [];

	for (let key in def.field) {
		const f = def.field[key];
		if (f.input === false) {
			continue;
		}

		if (f.type === 'detail') {
			const detail = getDefinition(f.detailEntity);

			result.push({
				name: key,
				label: f.label,
				type: f.type,
				inputList: definitionInputList(detail)
			});
		} else {
			result.push({
				name: key,
				label: f.label,
				type: f.type,
				defval: f.defval,
				nullable: f.nullable
			})
		}

	}

	return result;
}

async function list(db, cls, filter, order, paging) {
	const def = getDefinition(cls);

	const pagination = await preparePaging(db, def, filter, paging);
	const results = await doList(db, def, filter, order, paging)

	return {
		results: results,
		pagination: pagination
	}
}


async function doList(db, def, filter, order, paging) {
	return await doRead(db, def, filter, order, paging, false, 'LIST');
}

async function preparePaging(db, def, filter, paging) {
	paging = paging || {};
	paging.page = paging.page || 1;
	paging.pageSize = paging.pageSize || DEF_PAGE_SIZE;

	let sql = `select count(id) as count from ${def.table}`;
	let param = [];

	if (Array.isArray(filter) && filter.length > 0) {
		let where = whereFilter(def, filter, param);
		sql = sql + ` where ${where}`;
	}

	const rs = await db.query(sql, param);

	let rowCount = 0;
	if (rs.rows.length > 0) {
		rowCount = rs.rows[0].count;
		rowCount = parseInt(rowCount, 10);
	}

	const pageCount = Math.ceil(rowCount / paging.pageSize);

	const result = {
		page: paging.page,
		pageSize: paging.pageSize,
		rowCount: rowCount,
		pageCount: pageCount,
		more: paging.page < pageCount
	}

	return result;
}

async function prepareEdit(db, cls, content) {
	if (content._operation === 'EDIT') {

		const def = getDefinition(cls);
		await dbutil.lockById(db, def.table, content.id);

		const current = await read(db, cls, {
			id: content.id
		}, 'INPUT');

		const result = padUpContent(current, content);
		return result;
	}

	throw 'cannot prepareEdit because _operation is not EDIT';
}


function padUpContent(source, update) {
	let result = source;

	for (let key in update) {
		const value = update[key]

		if (Array.isArray(value)) {
			result[key] = padUpContentDetail(result[key], value);
		} else {
			result[key] = value;
		}
	}

	return result;
}

function padUpContentDetail(source, update) {
	let result = source;

	if (Array.isArray(result) === false) {
		result = [];
	}

	for (let idx = 0; idx < update.length; idx++) {
		const value = update[idx];

		if (value._operation === 'EDIT' || value._operation === 'DELETE') {
			let pos = indexOfId(source, value.id);
			if (pos === -1) {
				// Updating or DELETING an already deleted record
				continue;
			}

			result[pos] = padUpContent(source[pos], value);
		} else if (value._operation === 'INSERT') {
			result.push(value);
		}
	}

	return result;
}

function indexOfId(arr, id) {
	if (id === undefined) {
		return -1;
	}

	for (let result = 0; result < arr.length; result++) {
		if (arr[result].id === id) {
			return result;
		}
	}

	return -1;
}

function getDefinition(cls) {
	return require('./entity/' + asEntityName(cls));
}

function asEntityName(cls) {
	return cls + 'Entity';
}

function getService(cls) {
	return require('./service/' + asServiceName(cls));
}

function asServiceName(cls) {
	return cls + 'Service';
}

module.exports = {
	read,
	write,
	input,
	list,

	prepareEdit,

	getDefinition,
	getService,
}