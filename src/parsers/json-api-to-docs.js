'use strict';
 
var bluebird = require('bluebird'),
	fs = bluebird.promisifyAll(require('fs')),
	_ = require('lodash'),
	path = require('path'),
	Handlebars = require('handlebars');
	

module.exports = {
	
	init: function (options) {
		this.options = options || {};
		this.docPageTplPath = options.docPageTplPath;
		this.navJson = options.navJson;
	},
	
	
	parse: function (docJson, templater) {
		var	docPageTpl = Handlebars.compile(fs.readFileSync(this.docPageTplPath).toString());
		
		return docPageTpl({
			navigation: this.navJson,
			model: docJson,
			content: templater(docJson)
		});
	}

};
