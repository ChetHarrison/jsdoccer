'use strict';

module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		jshint: {
			files: ['./*.js'],
			// configure JSHint (documented at http://www.jshint.com/docs/)
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			}
		},

		watch: {
			files: ['<%= jshint.files %>'],
			tasks: ['jshint', 'qunit']
		},

		jasmine_node: {
			coverage: {
				options: {
					failTask: true,
					branches: 100,
					functions: 100,
					statements: 100,
					lines: 100
				}
			},
			options: {
				forceExit: true,
				match: '.',
				matchall: false,
				extensions: 'js',
				specNameMatcher: 'spec',
				jUnit: {
					report: false,
					savePath: './reports/',
					useDotNotation: true,
					consolidate: true
				}
			}
		},

		plato: {
			report: {
				options: {
					jshint: grunt.file.readJSON('.jshintrc')
				},
				files: {
					reports: ['!Gruntfile.js', '<%= jshint.files %>']
				}
			}
		},
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.loadNpmTasks('grunt-jasmine-node');

	grunt.loadNpmTasks('grunt-plato');


	grunt.registerTask('test', ['jshint', 'jasmine_node', 'plato']);

	grunt.registerTask('default', ['jasmine_node']);
};
