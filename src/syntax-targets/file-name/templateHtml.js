'use strict';

var fs = 					require('fs'),
	path = 					require('path'),
	Handlebars = 			require('handlebars'),
	constructorTemplater = 	require('../constructor/templateHtml.js'),
	eventTemplater = 		require('../event/templateHtml.js'),
	propertyTemplater = 	require('../property/templateHtml.js'),
	functionTemplater = 	require('../function/templateHtml.js'),
	htmlTemplateLoader = 	require('../../util/html-template-loader.js');

module.exports = function(model) {
	var template = htmlTemplateLoader(
			path.join(__dirname, 'templates/html.hbs')
		);

	if (model.constructor) { 
		console.log('found a constructor');
		console.log(model.constructor.toString());
		model.constructor = constructorTemplater(model); 
	}
	model.event = 		eventTemplater(model);
	model.property = 	propertyTemplater(model);
	model.function = 	functionTemplater(model);
	
	return template(model);
};