'use strict';

var _taskName	= 'jsDoccer:yaml',
	jsDoccer 	= require('../src/jsdoccer.js');


module.exports = function (grunt) {
	
	grunt.registerMultiTask(_taskName, 'Generate a stubbed YAML doc template.', function () {
		
		jsDoccer.init({
			config: grunt.config.get(_taskName).doc.options
		});
		
		jsDoccer.generateStubbedDocYamlFiles(this.filesSrc);
		
		grunt.log.ok(this.filesSrc.length + ' ' + grunt.util.pluralize(this.filesSrc.length, 'file/files') + ' documented.');
	
	});
	
};


