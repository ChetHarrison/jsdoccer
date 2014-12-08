'use strict';

var fs = require('fs'),
	path = require('path'),
	handlebars = require('handlebars');

module.exports = function(model) {
	var templatePath = path.resolve('./templates/html.hbs'), 
		template = handlebars.compile(fs.readFileSync(templatePath, 'utf8'));
	return template(model);
};