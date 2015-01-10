'use strict';

var shjs = require('shelljs'),
	stripJsonComments = require('strip-json-comments');

// jshint's config loader http://jshint.com/
module.exports = function (filePath) {
	if (!filePath) {
		return {};
	}

	if (!shjs.test('-e', filePath)) {
		throw 'Can\'t find config file: ' + filePath;
	}

	try {
		var config = JSON.parse(stripJsonComments(shjs.cat(filePath)));
		return config;
	} catch (err) {
		throw 'Can\'t parse config file: ' + filePath ;
	}
};