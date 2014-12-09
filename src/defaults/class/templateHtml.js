'use strict';

var fs = require('fs'),
	path = require('path'),
	handlebars = require('handlebars');

module.exports = function(model) {
	var classTemplatePath = path.resolve('./templates/html.hbs'),
		partial, template;
		
		// TODO: add partials
	
		handlebars.registerPartial({
		  'constructor': partial,
		  'event': partial,
		  'properties': partial,
		  'function': partial
		}); 
		
	template = handlebars.compile(fs.readFileSync(classTemplatePath, 'utf8'));
	
	return template(model);
};