'use strict';

var fs = require('fs'),
	path = require('path'),
	Handlebars = require('handlebars'),
	constructorTemplater = require('../constructor/templateHtml.js'),
	eventTemplater = require('../event/templateHtml.js'),
	propertyTemplater = require('../property/templateHtml.js'),
	functionTemplater = require('../function/templateHtml.js'),
	htmlTemplateLoader = require('../../util/html-template-loader.js');

module.exports = function(model) {
	var template = htmlTemplateLoader(path.join(__dirname, 'templates/html.hbs'));
	
	model.constructor = constructorTemplater(model);
	model.events = eventTemplater(model);
	model.properties = propertyTemplater(model);
	model.functions = functionTemplater(model);
	
	console.log('--------------------------');
	console.log(model);
	console.log('--------------------------');
	
	return template(model);
};