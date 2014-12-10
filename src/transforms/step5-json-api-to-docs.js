'use strict';
 
var bluebird = require('bluebird'),
	_ = require('lodash'),
	path = require('path'),
	fs = bluebird.promisifyAll(require('fs')),
	Handlebars = require('handlebars');
	

module.exports = {
	
	init: function (options) {
		this.options = options || {};
		this.htmlTemplate = options.htmlTemplate;
		this.navJson = options.navJson;
	},
	
	
	generate: function (docJson, templater) {
		var	docPageTpl = Handlebars.compile(fs.readFileSync(this.htmlTemplate).toString());
		
		return docPageTpl({
			navigation: this.navJson,
			model: docJson,
			content: templater(docJson)
		});
	}
};
