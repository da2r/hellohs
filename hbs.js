const fs = require('fs');
const Handlebars = require('handlebars');

Handlebars.registerHelper('toJSON', function (obj) {
	if (obj) {
		return JSON.stringify(obj);
	} else {
		return 'null';
	}
});

function render(filePath, options, callback) { // define the template engine
	doRender(filePath, options).then(function (content) {
		callback(null, content)
	}).catch(console.error);
};

async function doRender(filePath, options) {
	let content = await readFile(filePath);

	let layoutName;
	if (options.layout === undefined) {
		layoutName = 'default';
	} else {
		layoutName = options.layout;
	}

	if (layoutName) {
		const layoutPath = getLayoutPath(layoutName);
		let layout = await readFile(layoutPath);
		content = layoutRender(layout, content);
	}

	return hbsRender(content, options.context);
}

function getLayoutPath(layoutName) {
	return './views/layouts/' + layoutName + '.hbs';
}

function hbsRender(str, context) {
	const template = Handlebars.compile(str);
	const rendered = template(context);

	return rendered;
}

function layoutRender(layout, body) {
	return layout.replace('##body##', body);
}

function readFile(filename) {
	return new Promise(function (resolve, resject) {
		fs.readFile(filename, 'utf8', function (err, data) {
			resolve(data);
		});
	})
}

module.exports = {
	render: render
}