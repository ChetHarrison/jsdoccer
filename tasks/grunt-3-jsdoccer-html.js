'use strict';

var _taskName	= 'jsDoccer:html',
	jsDoccer 	= require('../src/jsdoccer.js');

module.exports = function (grunt) {
	grunt.registerMultiTask(_taskName, 'Compile jsdoc JSON files to HTML documentation', function () {
		
		jsDoccer.init({
			config: grunt.config.get(_taskName).doc.options
		});
		
		jsDoccer.generateDocs(this.filesSrc);

		grunt.log.ok(this.filesSrc.length + ' ' + grunt.util.pluralize(this.filesSrc.length, 'file/files') + ' documented.');

	});

};
