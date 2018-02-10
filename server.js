'use strict';

const port = 8615

let express = require('express');
let svr = express();

// FAVICON
let favicon = require('serve-favicon');
svr.use(favicon('./static/favicon.ico'));

// STATIC
svr.use('/static', express.static('./static'))

// API
const bodyParser = require('body-parser')
svr.use(bodyParser.json());
svr.use(bodyParser.urlencoded({
	extended: true
}));

svr.post('/api', require('./api-manager'));

svr.get('/select/*', require('./select-manager'));

// PAGE
const hbs = require('./hbs');
svr.engine('hbs', hbs.render);
svr.set('view engine', 'hbs');

svr.get('/*', require('./action-manager'));

// START
const dbupdate = require('./dbupdate');
dbupdate.update().then(() => {
	svr.listen(port, () => {
		console.log('Server started on port ' + port);
	})
});
