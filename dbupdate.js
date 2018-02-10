const capp = require('./capp');

const dbutil = require('./util/dbutil');
const client = dbutil.client();

async function createdb() {
	const rc = dbutil.rootclient();
	await rc.connect();

	const rs = await rc.query(`SELECT datname FROM pg_catalog.pg_database WHERE lower(datname) = 'sjpda'`);
	if (rs.rows.length == 0) {
		await rc.query('CREATE DATABASE sjpda');
	}
}

async function getVersion() {
	let rs = await client.query(`SELECT to_regclass('app_data') AS exists`);
	if (rs.error) {
		throw rs.error;
	}

	if (rs.rows[0].exists) {
		rs = await client.query(`SELECT ver AS version FROM app_data LIMIT 1`);
		if (rs.error) {
			throw rs.error;
		}
		return rs.rows[0].version;
	} else {
		return 0;
	}
}

async function run(sql) {
	if (sql) {
		try {
			const rs = await client.query(sql);
			if (rs.error) {
				throw rs.error;
			}
		} catch (t) {
			console.log('DBUpdate Error Executing SQL : ' + sql);
			throw t;
		}
	}
}

async function exec(version) {
	try {
		console.log(`updating database to version ${version}`);

		await client.query('BEGIN')

		const fs = require('fs');
		const content = fs.readFileSync(`./dbupdate/${version}.sql`).toString('utf8');
		const lines = content.split('\n');

		let buffer = '';
		for (let idx = 0; idx < lines.length; idx++) {
			const line = lines[idx];

			if (line.startsWith('--')) {
				continue;
			}

			if (line == '') {
				await run(buffer);
				buffer = '';
			} else {
				buffer = buffer + line;
			}
		}

		if (buffer) {
			await run(buffer);
			buffer = '';
		}

		client.query(`UPDATE app_data set ver = ${version}`);

		await client.query('COMMIT')
	} catch (t) {
		console.error(t);
		await client.query('ROLLBACK')
		throw t
	} finally {
		client.end()
	}
}

async function update() {
	try {
		await createdb();

		await client.connect();

		let version = await getVersion();
		console.log('database version : ' + version);
		while (version < capp.version) {
			await exec(++version);
		}
	} catch (t) {
		console.error('Failed updating database');
		console.error(t);
	}
}


exports.update = update;