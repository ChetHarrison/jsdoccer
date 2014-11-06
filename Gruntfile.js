'use strict';

module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		jshint: {
			files: ['./src/**/*.js', './tasks/grunt-1-jsdoccer-yaml.js'],
			// configure JSHint (documented at http://www.jshint.com/docs/)
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			}
		},

		watch: {
			files: ['<%= jshint.files %>'],
			tasks: ['jshint', 'clean:build']
		},

		clean: {
			build: ['./ast/*', './jsdoc/*', './json/*', './yaml/*']
		},

		jasmine_node: {
			coverage: {},
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
					reports: ['syntax-matchers.js', '<%= jshint.files %>']
				}
			}
		},

		sass: {
			options: {
				compass: true
			},
			dist: {
				files: {
					'styles/api.css': 'stylesheets/api.scss'
				}
			}
		},

		'jsDoccerYaml': {
			doc: {
				options: {
					filesToFilter: [
						'.DS_Store',
						'filter-this.js'
					]
				},
				files: [{
					expand: true,
					src: 'js/*.js',
				}]
			}
		},

		'jsDoccerJson': {
			doc: {
				options: {
					filesToFilter: [
						'.DS_Store',
						'filter-this.js'
					]
				},
			}
		},

		'jsDoccerHtml': {
			doc: {
				options: {
					filesToFilter: [
						'.DS_Store',
						'filter-this.js'
					]
				},
			}
		},
		
		'jsDoccerDoc': {
			doc: {
				options: {
					filesToFilter: [
						'.DS_Store',
						'filter-this.js'
					]
				},
			}
		}
	});

	grunt.loadTasks('tasks');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-jasmine-node-coverage');
	grunt.loadNpmTasks('grunt-jasmine-node');
	grunt.loadNpmTasks('grunt-plato');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-sass');

	grunt.registerTask('yaml', 'Build stubbed YAML files.', ['jsDoccerYaml']);
	grunt.registerTask('json', 'Build jsdoc JSON files.', ['jsDoccerJson']);
	grunt.registerTask('html', 'Build jsdoc HTML files.', ['jsDoccerHtml']);
	grunt.registerTask('doc', 'Build jsdoc HTML files from YAML.', ['jsDoccerDoc']);
	grunt.registerTask('test', 'Lint, hint, test, coverage, and complexity.', ['jshint', 'jasmine_node']);
	grunt.registerTask('default', 'Run test suite.', ['jasmine_node']);
	grunt.registerTask('build', 'build sass', ['sass']);
};
