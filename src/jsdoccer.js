'use strict';

var fs = require('fs'),
	path = require('path'),
	_ = require('lodash'),
	glob = require('glob'),
	// parsers
	jsToAst = require('./parsers/js-to-ast'),
	astToJsonPre = require('./parsers/ast-to-json-pre.js'),
	jsonPreToYamlStubbed = require('./parsers/json-pre-to-yaml-stubbed.js'),
	yamlDocumentedToJsonApi = require('./parsers/yaml-documented-to-json-api.js'),
	jsonApiToDocs = require('./parsers/json-api-to-docs.js'),
	
	_globToFileList = function(fileGlobs) {
		var files = [];
		console.log(fileGlobs);
		fileGlobs.forEach(function(fileGlob) { files.push(glob.sync(fileGlob)); });
		files = files.mergeAll();
		console.log(files);
		return files;
	};
	


module.exports = {
	
	init: function(options) {
		var targets = [],
			linters = {},
			matchers = {},
			yamlTemplaters = {},
			htmlTemplaters = {},
			dest, intermediate;
			
		options = options || {};
		this.config = options;
		
		
		// set up local working directory
		dest = options.dest;
		intermediate = 'intermediate/';
		
		this.paths = {
			dest: path.resolve(dest),
			intermediate: path.resolve(path.resolve(dest, intermediate)),
			ast: path.resolve(dest, intermediate + 'ast'),
			jsonPre: path.resolve(dest, intermediate + 'json-pre'),
			yamlStubbed: path.resolve(dest, intermediate + 'yaml-stubbed'),
			jsonApi: path.resolve(dest, intermediate + 'json-api'),
			docs: path.resolve(dest, 'docs')
		};
		
		_.each(this.paths, function(aPath) {
			if (!fs.existsSync(aPath)) {
				fs.mkdirSync(aPath);
			}
		});
		
		
		// configure targets
		targets = Object.keys(this.config.targets.default)
			.filter(function(target) {
				return this.config.targets.default[target]; // filter false values in config
			}, this);
		
		_.each(targets, function(target) {
			var src = './syntax-targets/' + target;
			linters[target] 		= require(src + '/linter.js');
			matchers[target] 		= require(src + '/matcher.js');
			yamlTemplaters[target] 	= require(src + '/templateYaml.js');
			htmlTemplaters[target] 	= require(src + '/templateHtml.js');	
		}, this);
	
		// TODO: load custom syntax targets and associated functions
		
		astToJsonPre.init({ matchers: matchers });
		jsonPreToYamlStubbed.init({ yamlTemplaters: yamlTemplaters });
		yamlDocumentedToJsonApi.init({ targets: targets });
		jsonApiToDocs.init({ htmlTemplaters: htmlTemplaters });
	},
	
	// convert a glob arg to array of file paths
	// read in each file and apply the parser function
	// save the results and return the number of parsed files
	_parseGlobs: function (fileGlobs, steps) {
		var files = _globToFileList(fileGlobs);
		console.log('------');
		console.log(files);
		console.log('------');
		_.each(files, function (file) {
			var input = fs.readFileSync(file, 'utf8');
			_.each(steps, function (step) {
				
				var output = step.parser.parse(input),
					dest = path.join(
						step.dest, 
						path.basename(file, path.extname(file)) + '.' + step.ext
					);
				console.log(output);
				fs.writeFileSync(dest, output);
				// this feeds the output of one parser into the 
				// input of the next parser
				input = output; 
			});
		});
		
		return files.length;
	},
	
	// Generate stubbed yaml file.
	stub: function(globs) {
		return this._parseGlobs(globs, [{ 
				parser: jsToAst,
				dest: this.paths.ast,
				ext: 'ast'
			}, {
				parser: astToJsonPre, 
				dest: this.paths.jsonPre,
				ext: 'json'
			}, {
				parser: jsonPreToYamlStubbed,
				dest: this.paths.yamlStubbed,
				ext: 'yaml'
			}]);
	},
	
	// Generate html documentation from documented yaml
	doc: function(globs) {
		return this._parseGlobs(globs, [{ 
				parser: yamlDocumentedToJsonApi,
				dest: this.paths.jsonApi,
				ext: 'json'
			}, {
				parser: jsonApiToDocs, 
				dest: this.paths.docs,
				ext: 'html'
			}]);
	},
	
	// Lint the documentation
	lint: function(globs) {
		console.log('TODO: Implement the linter.');
	}
};

