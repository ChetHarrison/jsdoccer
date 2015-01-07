'use strict';
 
var bluebird = require('bluebird'),
	fs = bluebird.promisifyAll(require('fs')),
	_ = require('lodash'),
	path = require('path'),
	Handlebars = require('handlebars');
	// aliasCollision = require('alias-collision');
	

module.exports = {
	
	init: function(options) {
		options = options || {};
		this.htmlTemplaters = options.htmlTemplaters;
		this.docPageTplPath = options.docPageTplPath;
		this.projectName = options.projectName;
	},
	
	
	parse: function (jsonApi) {
		var	docPageTpl = Handlebars.compile(fs.readFileSync(this.docPageTplPath).toString()),
			contentTemplater = this.htmlTemplaters['class'],
			model = {},
			file = {};
		
		jsonApi = JSON.parse(jsonApi);
		
		// TODO: elevate the namespacing to jsdoccer so we don't collide
		// with a function named 'nav'.
		model.projectName = this.projectName;
		model.nav = jsonApi.nav;
		model.file = file;
		model.file.name = jsonApi.name;
		model.file.constructors = jsonApi.constructors;
		model.file.functions = jsonApi.functions;
		model.file.properties = jsonApi.properties;
		model.file.events = jsonApi.events;
		model.content = contentTemplater(jsonApi); // currently we are not passing in a templater
		
		return docPageTpl(model);
	}

};