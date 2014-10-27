'use strict';

var _ 			= require('lodash'),
	jsDoccer 	= require('../src/jsdoccer.js');

function stubDocYaml(grunt, filepath, options, config) {
	if (!grunt.file.exists(filepath)) {
		return false;
	}

	try {
		// no-write existing yaml?
		if (!options['no-write']) {
			grunt.verbose.writeln('no "no-write" property in options.');

			jsDoccer.init(config.options.syntaxMatchers.src, config.options);		
			jsDoccer.generateStubbedDocYamlFile(filepath);
		}
		grunt.verbose.writeln((options['no-write'] ? 'Not actually writing doc YAML ' : 'Writing doc YAML ') + filepath + '...');
	} catch (e) {
		grunt.log.error();
		grunt.fail.warn('Unable to write YAML "' + filepath + '" file (' + e.message + ').', e);
	}
}

module.exports = function (grunt) {
	grunt.registerMultiTask('jsDoccer', 'Generate a stubbed YAML doc template.', function () {
		// Merge task-specific and/or target-specific options with these defaults.
		var options = this.options({
				force: grunt.option('force') === true,
				'no-write': grunt.option('no-write') === true
			}),
			config 	= grunt.config.get('jsDoccer');

		// Doc specified files / dirs.
		this.filesSrc.forEach(function (filepath) {
			stubDocYaml(grunt, filepath, options, config);
		});
		grunt.log.ok(this.filesSrc.length + ' ' + grunt.util.pluralize(this.filesSrc.length, 'file/files') + ' documented.');
	});

};
