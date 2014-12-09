'use strict';

var fs = require('fs'),
	_ = require('lodash');

module.exports = function(templatePath) {
	return	function(model) {
		var template = fs.readFileSync(templatePath, 'utf8');
		return _.template(template, model);
	};
};