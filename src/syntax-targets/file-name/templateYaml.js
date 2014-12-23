'use strict';

var path = require('path'),
	loader = require('../../util/yaml-template-loader.js');
	
module.exports = loader(path.join(__dirname, '/templates/yaml.tpl'));