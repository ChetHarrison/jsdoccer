'use strict';

module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		jshint: {
			files: ['!Gruntfile.js', './*.js'],
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
			coverage: { },
			options: {
				forceExit: true,
				match: '.',
				matchall: false,
				extensions: 'js',
				specNameMatcher: 'spec',
				jUnit: {
					report: true,
					savePath: './build/reports/jasmine/',
					useDotNotation: true,
					consolidate: true
				}
			},
			all: ['tests/specs/']
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

		jsDocFiles: {
			docs: {
				options: {},
				files: [{
					expand: true,
					cwd: 'yaml',
					src: '*.yaml',
					dest: 'jsdoc',
					ext: '.json'
        		}]
			}
		}
	});

	grunt.loadTasks('tasks');

	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.loadNpmTasks('grunt-contrib-watch');
	
	grunt.loadNpmTasks('grunt-jasmine-node-coverage');

	grunt.loadNpmTasks('grunt-jasmine-node');

	grunt.loadNpmTasks('grunt-plato');


	grunt.registerTask('api', 'Build jsdoc api files.', ['jsDocFiles']);

	grunt.registerTask('test', 'Lint, hint, test, coverage, and complexity.',['jshint', 'jasmine_node']);

	grunt.registerTask('default', 'Run test suite.', ['jasmine_node']);
};
