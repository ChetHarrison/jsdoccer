'use strict';

var _taskName	= 'jsDoccer:json',
	jsDoccer 	= require('../src/jsdoccer.js');

module.exports = function (grunt) {
	grunt.registerMultiTask(_taskName, 'Compile jsdoc YAML files to json', function () {
		
		jsDoccer.init({
			config: grunt.config.get(_taskName).doc.options
		});
		
		jsDoccer.prepareYamls(this.filesSrc);

		grunt.log.ok(this.filesSrc.length + ' ' + grunt.util.pluralize(this.filesSrc.length, 'file/files') + ' documented.');

	});

};
