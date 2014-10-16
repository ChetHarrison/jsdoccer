'use strict';

var fs = require('fs'),
	
	getConfig = function(filePath) {
		return JSON.parse(fs.readFileSync(filePath, 'utf8'));
	};


module.exports = getConfig;