'use strict';

module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		jshint: {
			files: ['./src/*.js'],
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
		},

		compileDocs: {
			marionette: {
				options: {
					repo: 'backbone.marionette',
					template: 'src/docs/template.html'
				},
				src: 'backbone.marionette/docs',
				dest: 'dist/docs'
			}
		},
		
		jsDoccer: {
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
					templates: './templates/',
					dest: './yaml/'
				},
				syntaxMatchers: {
					src: './syntax-matchers.js'
				},
				filesToFilter: [
					'.DS_Store',
					'filter-this.js'
				]
			},
			stubDocYaml: {
				src: './js/*',
			},
			nextTarget: {}
		}
	});

	grunt.loadTasks('tasks');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-jasmine-node-coverage');
	grunt.loadNpmTasks('grunt-jasmine-node');
	grunt.loadNpmTasks('grunt-plato');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask('yaml', 'Build stubbed YAML files.', ['jsDoccer:stubDocYaml']);
	grunt.registerTask('api', 'Build jsdoc api files.', ['jsDocFiles']);
	grunt.registerTask('test', 'Lint, hint, test, coverage, and complexity.', ['jshint', 'jasmine_node']);
	grunt.registerTask('default', 'Run test suite.', ['jasmine_node']);
	// grunt.registerTask('compile-docs', [
	//    	'compileDocs',
	//    	'less'
	//  	]);
};
