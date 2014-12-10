'use strict';

var fs = require('fs'),
  path = require('path'),
  handlebars = require('handlebars');

module.exports = function(templatePath) {
	return	function(model) {
		var template = handlebars.compile(fs.readFileSync(templatePath, 'utf8'));
	  
	  	return template(model);
	};
};