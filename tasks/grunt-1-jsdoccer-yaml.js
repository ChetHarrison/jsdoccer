'use strict';

var _ 			= require('lodash'),
	_taskName	= 'jsDoccerYaml',
	jsDoccer 	= require('../src/jsdoccer.js'),
	stubber;
	
stubber = { 
	
	init: function (options) {
		this.grunt = options.grunt;
	},
	
	stubFile: function (file) {
		jsDoccer.init({
			config: this.grunt.config.get(_taskName).doc.options
		});		
		jsDoccer.generateStubbedDocYamlFile(file);
	},
	
	stubFiles: function (files) {
		var self = this;
		files.forEach(function (file) {
			self.stubFile(file);
		});
	}
	
};


module.exports = function (grunt) {
	grunt.registerMultiTask(_taskName, 'Generate a stubbed YAML doc template.', function () {
		stubber.init({ grunt: grunt });
		stubber.stubFiles(this.filesSrc);
		grunt.log.ok(this.filesSrc.length + ' ' + grunt.util.pluralize(this.filesSrc.length, 'file/files') + ' documented.');
	});
};


