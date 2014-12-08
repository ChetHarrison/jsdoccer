'use strict';

var fs = require('fs'),
	path = require('path'),
	_ = require('lodash');

module.exports = function(model) {
	var template = fs.readFileSync(path.resolve('./templates/yaml.tpl'), 'utf8');
	return _.template(template, model);
};