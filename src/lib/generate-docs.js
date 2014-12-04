'use strict';
/**
 * 1. run grunt api
 * 2. read the json for each jsdoc
 * 3. compile master json and write it to the api folder
 * 4. build the html files
 */
 
var bluebird = require('bluebird'),
	_ = require('lodash'),
	path = require('path'),
	fs = bluebird.promisifyAll(require('fs')),
	Handlebars = require('handlebars'),
	taskName = 'jsDoccer:html',
	numberOfDocument;
	

module.exports = {
	
	init: function (options) {
		this.options = options || {};
		this.htmlTemplate = options.htmlTemplate;
	},

	buildApiJson: function (file) {
		var json = JSON.parse(fs.readdirSync(file));

		var apiJson = {};
		
		apiJson.classes = [];
		apiJson.functions = {};
		apiJson.properties = {};

		if (_.has(json, 'class')) {
			apiJson.classes.push(json);
		} else {
			if (_.has(json, 'functions')) {
				_.extend(apiJson.functions, json.functions);
			}
			if (_.has(json, 'properties')) {
				_.extend(apiJson.properties, json.properties);
			}
			if (_.has(json, 'events')) {
				_.extend(apiJson.events, json.events);
			}
		}

		return apiJson;
	},
	
	buildDocHtml: function (json) {
		// var json = JSON.parse(fs.readFileSync(file)),
		var	classTpl = Handlebars.compile(fs.readFileSync(this.htmlTemplate).toString()),
			classHtml = classTpl({
				marionette: json, // TODO: what does this do?
				klass: json
			});
		
		return classHtml;
	},
	
	generate: function (json) {
		return this.buildDocHtml(json);
	}
};
