'use strict';
 
var bluebird = require('bluebird'),
	fs = bluebird.promisifyAll(require('fs')),
	_ = require('lodash'),
	path = require('path'),
	Handlebars = require('handlebars');
	

module.exports = {
	
	init: function(options) {
		options = options || {};
		this.htmlTemplaters = options.htmlTemplaters;
		this.docPageTplPath = options.docPageTplPath;
		this.projectName = options.projectName;
	},
	
	
	parse: function (jsonApi) {
		var	docPageTpl = Handlebars.compile(fs.readFileSync(this.docPageTplPath).toString()),
			contentTemplater = this.htmlTemplaters['class'];
		
		jsonApi = JSON.parse(jsonApi);
		
		// TODO: elevate the namespacing to jsdoccer so we don't collide
		// with a function named 'nav'.
		
		return docPageTpl({
			projectName: this.projectName,
			nav: jsonApi.nav,
			file: {
				name: jsonApi.name,
				functions: jsonApi.functions,
				properties: jsonApi.properties,
				events: jsonApi.events
			},
			content: contentTemplater(jsonApi) // currently we are not passing in a templater
		});
	}

};