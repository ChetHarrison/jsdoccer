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

		'jsDoccer:yaml': {
			doc: {
				options: {
					ast: {
						dest: './ast/',
						save: true
					},
					json: {
						dest: './json/',
						save: true
					},
					yaml: {
						templates: './templates/yaml',
						src: '.yaml/doccumented-src/',
						dest: './yaml/stubbed-dest/'
					},
					syntaxMatchers: {
						src: './syntax-matchers.js'
					},
					filesToFilter: [
						'.DS_Store',
						'filter-this.js'
					]
				},
				files: [{
					expand: true,
					src: 'js/*.js',
					dest: '../../jsdoccer/generated-files/yaml/stubbed'
				}]
			}
		},

		'jsDoccer:json': {
			doc: {
				options: {},
				files: [{
					expand: true,
					src: '../../jsdoccer/generated-files/yaml/documented/*.yaml',
					dest: '../../jsdoccer/generated-files/doc-json/'
				}]
			}
		},

		'jsDoccer:html': {
			doc: {
				options: {
					handelbarsTemplate: './templates/jsdoc/class.hbs'
				},
				files: [{
					expand: true,
					src: '../../jsdoccer/generated-files/doc-json/*.json',
					dest: '../../jsdoccer/documentation'
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
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-sass');

	grunt.registerTask('yaml', 'Build stubbed YAML files.', ['jsDoccer:yaml']);
	grunt.registerTask('json', 'Build jsdoc JSON files.', ['jsDoccer:json']);
	grunt.registerTask('html', 'Build jsdoc HTML files.', ['jsDoccer:html']);
	grunt.registerTask('test', 'Lint, hint, test, coverage, and complexity.', ['jshint', 'jasmine_node']);
	grunt.registerTask('default', 'Run test suite.', ['jasmine_node']);
	grunt.registerTask('build', 'build sass', ['sass']);
};
