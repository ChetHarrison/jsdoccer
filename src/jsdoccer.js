'use strict';

// Dependencies
//-----------------------------------------
var fs = require('fs-extra'),
	path = require('path'),
	esprima = require('esprima'),
	_ = require('lodash'),
	// private 
	// delegate declarations
	_fileGlobber = require('./lib/file-globber.js'),
	_astGenerator = require('./lib/ast-generator.js'),
	_astToDocJson = require('./lib/ast-to-doc-json.js'),
	_docJsonToDocYaml = require('./lib/doc-json-to-doc-yaml.js'),
	_prepareYaml = require('./lib/prepare-yaml.js'),
	_generateDocs = require('./lib/generate-docs.js'),
	globsToFiles;



// API
//-----------------------------------------
module.exports = {
	
	// util
	stripExtention: function(file) {
		return path.basename(file, path.extname(file));
	},


	saveFile: function (data, file, filepath, extention) {
		var dest = path.join(this.config.dest, filepath, this.stripExtention(file) + extention);
		
		dest = path.resolve(dest);
		// format your json here
		if (_.contains(['.json', '.ast'], extention))  { data = JSON.stringify(data, null, 2); } 
		fs.writeFileSync(dest, data);
	},
	
	// NOTE: globs to the js src and the documented
	// yaml are passed in from the command line or
	// default to the .jsdoccerrc config file.
	configurePaths: function(options) {
		var self = this,
			paths = [],
			add = function(dir, name) {
				self[name] = path.join(dir, name);
				paths.push(self[name]);
				// console.log(self[name]); // <-- brain damage filter.
			};

		// all custom jsdoccer files live here
		this.dest = path.resolve(options.dest);
		
		// generated files live here
		// indentation shows file structure
		add(this.dest, 'generated');
		add(this.generated, 'json');
		add(this.generated, 'ast');
		add(this.generated, 'pre');
		add(this.generated, 'api');
		add(this.generated, 'yaml');
		add(this.yaml, 'stubbed');
		add(this.yaml, 'documented');
				
		// html documentation of js lives here
		add(this.dest, 'docs');
				
		// resource files
		this.syntaxMatchers = path.join(this.dest, 'syntax-matchers.js');
		this.setup =path.resolve('setup');
		add(this.dest, 'templates');
		add(this.templates, 'html');
		add(this.html, 'htmlTemplates');
		add(this.templates, 'yaml');
		
		return paths;
	},

	// set object state
	// Need to be able to configure: 
	//   * output dir path
	init: function init(options) {
		var syntaxMatchers, folders;

		options = options || {};
		folders = this.configurePaths(options);

		// check to see if we are set up
		try {
			syntaxMatchers = require(this.syntaxMatchers);
		} catch (err) {
			console.log('No "syntax-matchers.js" found. Setting up defaults.');
			fs.copySync(this.setup, this.dest);
			// github won't commit empty folders so we need to make those
			_.each(folders, function(folder) { fs.mkdirSync(folder); });
			syntaxMatchers = require(this.syntaxMatchers);
		}

		_astToDocJson.init({
			syntaxMatchers: syntaxMatchers
		});

		_docJsonToDocYaml.init({
			templates: this.yamlTemplates,
			dest: this.stubbedYaml
		});

		_prepareYaml.init({
			files: {
				dest: this.docJson			
			}
		});

		_generateDocs.init({
			htmlTemplate: this.htmlTemplate
		});
	},


	// Takes and optional array of file globs. If the 
	// the array is empty it defauts to the config "js.src"
	// in .jsdoccerrc for target js files. Saves all 
	// intermetiate files in the "dest" setup in the 
	// .jsdoccerrc file. This step includes asts,
	// intermediate json, and stubbed yaml files.
	stub: function (fileGlobs) {
		var files;
		// if no globs passed use config glob
		files = _fileGlobber(fileGlobs, this.config.js.src);
		
		_.each(files, function (file) {
			var syntaxTree, lookup, json, docYaml;

			// generate AST
			syntaxTree = _astGenerator.createSyntaxTree(file);
			this.saveFile(syntaxTree, file, this.ast, '.ast');

			// filter AST and generate syntax target JSON
			_astToDocJson.setFilename(file);
			json = _astToDocJson.parse(syntaxTree);
			this.saveFile(json, file, this.json, '.json');

			// generate document YAML
			docYaml = _docJsonToDocYaml.convert(json);
			this.saveFile(docYaml, file, this.stubbedYaml, '.yaml');
		}, this);
		return files.length;
	},

	
	// Takes and optional array of file globs. If the 
	// the array is empty it defauts to the config "yaml.src"
	// in .jsdoccerrc for target js files. Saves all 
	// intermetiate files in the "dest" setup in the 
	// .jsdoccerrc file. This step includes
	// intermediate json, and html documentation files.
	doc: function (fileGlobs) {
		var files;
		// if no globs passed use config glob
		files = _fileGlobber(fileGlobs, this.config.yaml.src);
		
		_.each(files, function (file) {
			var json, html; 
			
			// generate apiJson
			json = _prepareYaml.compileJsDoc(file);
			this.saveFile(json, file, this.docJson, '.json');
			
			// generate documentation html
			html = _generateDocs.generate(json);
			this.saveFile(html, file, this.documentation, '.html');
		}, this);
		return files.length;
	},


	lint: function () {
		console.log('TODO: Impliment this.');
	}
};
