'use strict';

// Dependencies
//-----------------------------------------
var fs = require('fs-extra'),
	path = require('path'),
	esprima = require('esprima'),
	_ = require('lodash'),
	_fileGlobber = require('./util/file-globber.js'),
	// private 
	// transforms
	_jsToAst = require('./transforms/step1-js-to-ast.js'),
	_astToJsonPre = require('./transforms/step2-ast-to-json-pre.js'),
	_jsonPreToYamlStubbed = require('./transforms/step3-json-pre-to-yaml-stubbed.js'),
	_yamlDocumentedToJsonApi = require('./transforms/step4-yaml-documented-to-json-api.js'),
	_jsonApiToDocs = require('./transforms/step5-json-api-to-docs.js'),
	
	registry = require('./util/registry'),
	globsToFiles;



// API
//-----------------------------------------
module.exports = {
	
	// util
	// strips the extention
	trimFileExtention: function(file) {
		return path.basename(file, path.extname(file));
	},


	saveFile: function (data, filepath, file, extention) {
		var dest;
		dest = path.join(filepath, this.trimFileExtention(file) + extention);
		dest = path.resolve(dest);
		// 															format your json here  V
		if (_.contains(['.json', '.ast'], extention))  { data = JSON.stringify(data, null, 2); } 
		fs.writeFileSync(dest, data);
	},
	
	// NOTE: globs to the js src and the documented
	// yaml are passed in from the command line or
	// default to the .jsdoccerrc config file.
	configurePaths: function(options) {
		var self = this,
			dirsToCreate = [],
			add = function(dir, name) {
				self[name] = path.join(dir, name);
				dirsToCreate.push(self[name]);
			};

		this.config = options;
		// all custom jsdoccer files live here
		this.dest = path.resolve(options.dest);
		
		// generated files live here
		// indentation shows file structure
		add(this.dest, 'generated');
		add(this.generated, 'json');
		add(this.json, 'ast');
		add(this.json, 'pre');
		add(this.json, 'api');
		add(this.generated, 'yaml');
		add(this.yaml, 'stubbed');
		add(this.yaml, 'documented');
				
		// html documentation of js lives here
		add(this.dest, 'docs');
				
		// TODO: FILTER THESE GUYS FROM THE PATHS ARRAY RETURNED
		// resource files
		this.syntaxMatchers = path.join(this.dest, 'syntax-matchers.js');
		this.setup = path.resolve('setup');
		this.yamlTemplates = path.join(this.dest, 'templates/yaml');
		this.htmlTemplates = path.join(this.dest, 'templates/html/class.hbs');
		
		return dirsToCreate;
	},

	// set object state
	// Need to be able to configure: 
	//   * output dir path
	init: function init(options) {
		var syntaxMatchers, dirsToCreate;

		options = options || {};
		dirsToCreate = this.configurePaths(options);
		this._docType = Object.create(registry);

		// check to see if we are set up
		try {
			syntaxMatchers = require(this.syntaxMatchers);
		} catch (err) {
			console.log('No "syntax-matchers.js" found. Setting up defaults.');
			fs.copySync(this.setup, this.dest);
			// github won't commit empty folders so we need to make those
			_.each(dirsToCreate, function(folder) { fs.mkdirSync(folder); });
			syntaxMatchers = require(this.syntaxMatchers);
		}

		_astToJsonPre.init({
			syntaxMatchers: syntaxMatchers
		});

		_jsonPreToYamlStubbed.init({
			templates: this.yamlTemplates,
			dest: this.stubbed
		});

		_yamlDocumentedToJsonApi.init();

		_jsonApiToDocs.init({
			htmlTemplate: this.htmlTemplates
		});
	},
	
	
	addDocType: function(options) {
		this._docType.register(options.name, {
			syntaxMatcher: options.syntaxMatcher,
			templateYaml: options.templateYaml,
			templateHtml: options.templateHtml,
			lintDoc: options.lintDoc
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
			syntaxTree = _jsToAst.createSyntaxTree(file);
			this.saveFile(syntaxTree, this.ast, file, '.ast');

			// filter AST and generate syntax target JSON
			_astToJsonPre.setFilename(file);
			json = _astToJsonPre.parse(syntaxTree);
			this.saveFile(json, this.pre, file, '.json');

			// generate document YAML
			docYaml = _jsonPreToYamlStubbed.convert(json);
			this.saveFile(docYaml, this.stubbed, file, '.yaml');
			
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
		files = _fileGlobber(fileGlobs, this.config.documentedYaml.src);
		
		_.each(files, function (file) {
			var json, html; 
			
			// generate apiJson
			json = _yamlDocumentedToJsonApi.compileJsDoc(file);
			this.saveFile(json, this.api, file, '.json');
			
			// generate documentation html
			html = _jsonApiToDocs.generate(json);
			this.saveFile(html, this.docs, file, '.html');
		}, this);
		return files.length;
	},


	lint: function () {
		console.log('TODO: Impliment this.');
	}
};
