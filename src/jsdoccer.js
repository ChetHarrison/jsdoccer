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
	jsonApiToDocs = require('./parsers/json-api-to-docs.js');
	
module.exports = {
	
	_globToFileList: function(fileGlobs) {
		var files = [];
		fileGlobs.forEach(function(fileGlob) { files.push(glob.sync(fileGlob)); });
		files = files.mergeAll();
		return files;
	},
	
	
	init: function(options) {
		var targets = [],
			linters = {},
			matchers = {},
			yamlTemplaters = {},
			htmlTemplaters = {},
			dest, intermediate;
			
		options = options || {};
		this.config = options;
		this.config.projectName = this.config.projectName || 
			path.basename(process.cwd());
	
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
		// The way we do this is to load paths to default folders 
		// and custom folders with the same dir structure we can
		// dry up a lot of code and split out a config inti mod with
		// this approach and make the tool super extensable.
		
		astToJsonPre.init({ matchers: matchers });
		jsonPreToYamlStubbed.init({ yamlTemplaters: yamlTemplaters });
		// yamlDocumentedToJsonApi.init({ targets: targets });
		jsonApiToDocs.init({ 
			htmlTemplaters: htmlTemplaters,
			docPageTplPath: path.resolve('src/syntax-targets/docs-index.hbs'),
			projectName: this.config.projectName
		});
	},
	
	
	_fileName: function(filePath) {
		return path.basename(filePath, path.extname(filePath));
	},
	
	// convert a glob arg to array of file paths
	// read in each file and apply the parser function
	// save the results and return the number of parsed files
	_parseGlobs: function (fileGlobs, steps) {
		var files = this._globToFileList(fileGlobs);
		
		_.each(files, function (file) {
			var input = fs.readFileSync(file, 'utf8');
			_.each(steps, function (step) {
				
				var output = step.parser.parse(input),
					dest = path.join(
						step.dest, 
						this._fileName(file) + '.' + step.ext
					);
					
				if (step.needsFileName) {
					output = JSON.parse(output);
					output['name'] = {
						name: this._fileName(file)
					};
					output = JSON.stringify(output, null, 2);
				}
				
				if (step.jsonNav) {
					output = JSON.parse(output);
					output.nav = step.jsonNav;
					output = JSON.stringify(output, null, 2);
				}
				fs.writeFileSync(dest, output);
				// this feeds the output of one parser into the 
				// input of the next parser
				input = output; 
			}, this);
		}, this);
		
		return files.length;
	},
	
	
	_buildJsonNav: function (fileGlobs) {
		var files = this._globToFileList(fileGlobs),
			jsonNav = {files: []};
		_.each(files, function (file) {
			jsonNav.files.push({name: this._fileName(file)});
		}, this);
		
		return jsonNav;
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
				ext: 'json',
				needsFileName: true
			}, {
				parser: jsonPreToYamlStubbed,
				dest: this.paths.yamlStubbed,
				ext: 'yaml'
			}]);
	},
	
	// Generate html documentation from documented yaml
	doc: function(globs) {
		var jsonNav = this._buildJsonNav(globs);
			
		return this._parseGlobs(globs, [{ 
				parser: yamlDocumentedToJsonApi,
				dest: this.paths.jsonApi,
				ext: 'json',
				jsonNav: jsonNav
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
	


