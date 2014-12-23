'use strict';

var fs = require('fs'),
  path = require('path'),
  Handlebars = require('handlebars');

module.exports = function(templatePath) {
	return	function(model) {
		var template = Handlebars.compile(fs.readFileSync(templatePath, 'utf8').toString());
		
	  	return template(model);
	};
};