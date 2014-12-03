'use strict';

var shjs = require('shelljs'),
	stripJsonComments = require('strip-json-comments');

// jshint's config loader http://jshint.com/
module.exports = function (filePath) {
	if (!filePath) {
		return {};
	}

	if (!shjs.test('-e', filePath)) {
		console.warn('Can\'t find config file: ' + filePath);
		exports.exit(1);
	}

	try {
		var config = JSON.parse(stripJsonComments(shjs.cat(filePath)));
		return config;
	} catch (err) {
		console.warn('Can\'t parse config file: ' + filePath);
		exports.exit(1);
	}
};