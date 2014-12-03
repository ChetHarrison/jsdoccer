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
	_generateDocs = require('./lib/generate-docs.js');



// API
//-----------------------------------------
module.exports = {

	// set object state
	// Need to be able to configure: 
	//   * output dir path
	init: function init(options) {
		var syntaxMatchers, syntaxMatchersPath, 
			setUpSrcPath, config;

		options = options || {};
		config = this.config = options.config;
		
		this.generatedFiles = path.join(config.dest, 'generated');
		this.yaml = path.join(this.generatedFiles, 'yaml');
		this.stubbedYaml = path.join(this.generatedFiles, 'yaml/stubbed');
		this.documentedYaml = path.join(this.generatedFiles, 'yaml/documented');
		this.ast = path.join(this.generatedFiles, 'ast');
		this.json = path.join(this.generatedFiles, 'json');
		this.docJson = path.join(this.generatedFiles, 'docJson');
		this.htmlTemplate = path.join(config.dest, 'templates/html');
		this.documentation = path.join(config.dest, 'docs');
		
		console.log(this.generatedFiles);
		console.log(this.stubbedYaml);
		console.log(this.documentedYaml);
		console.log(this.ast);
		console.log(this.json);
		console.log(this.docJson);
		console.log(this.htmlTemplate);
		console.log(this.documentation);
		
		
		// check to see if we are set up
		try {
			syntaxMatchersPath = path.resolve(process.cwd(), config.dest + 'syntax-matchers.js');
			console.log(syntaxMatchersPath);
			syntaxMatchers = require(syntaxMatchersPath);
		} catch (err) {
			setUpSrcPath = path.resolve(__dirname + '/../setup/');
			console.log('No "syntax-matchers.js" found. Setting up defaults.');
			fs.copySync(setUpSrcPath, path.resolve('./' + config.dest));
			// github won't commit empty folders so we need to make those
			fs.mkdirSync(this.generatedFiles);
			fs.mkdirSync(this.ast);
			fs.mkdirSync(this.docJson);
			fs.mkdirSync(this.json);
			fs.mkdirSync(this.yaml);
			fs.mkdirSync(this.stubbedYaml);
			fs.mkdirSync(this.documentedYaml);
			fs.mkdirSync(this.documentation);
			syntaxMatchers = require(syntaxMatchersPath);
		}

		_astToDocJson.init({
			syntaxMatchers: syntaxMatchers
		});

		_docJsonToDocYaml.init({
			templates: path.join(config.dest, 'templates/yaml'),
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

	// utilities
	saveFile: function (data, file, filepath, extention) {
		var dest = path.join(this.config.dest, filepath, path.basename(file, '.js') + extention);
		console.log('-----Saving to :' + dest);
		fs.writeFileSync(dest, data);
	},


	// control
	stubFile: function (file) {
		var syntaxTree, lookup, json, docYaml;

		// generate AST
		syntaxTree = _astGenerator.createSyntaxTree(file);
		this.saveFile(JSON.stringify(syntaxTree, null, 2), file, this.ast, '.ast');

		// filter AST and generate syntax target JSON
		_astToDocJson.setFilename(file);
		json = _astToDocJson.parse(syntaxTree);
		this.saveFile(JSON.stringify(json, null, 2), file, this.json, '.json');

		// generate document YAML
		docYaml = _docJsonToDocYaml.convert(json);
		this.saveFile(docYaml, file, this.stubbedYaml, '.yaml');
	},


	stubFiles: function (files) {
		_.each(files, function (file) {
			this.stubFile(file);
		}, this);
		return files.length;
	},


	yamlFile: function (file) {
		var yaml = _prepareYaml.prepare(file);
		this.saveFile(yaml, file, this.config.yamlDocumented, '.yaml');
	},


	yamlFiles: function (files) {
		_.each(files, function (file) {
			this.yamlFile(file);
		}, this);
		return files.length;
	},


	documentFile: function (file) {
		var html = _generateDocs.generate(file);
		this.saveFile(html, file, this.config.htmlDocumentation, '.html');
	},


	documentFiles: function (files) {
		_.each(files, function (file) {
			this.documentFile(file);
		}, this);
		return files.length;
	},
	
	
	stubGlobs: function (fileGlobs) {
		var files;
		// if no globs passed use config glob
		if (fileGlobs.length === 0) { fileGlobs = this.config.js.src; }
		files = _fileGlobber(fileGlobs);
		return this.stubFiles(files);
	},
	
	
	documentGlobs: function (fileGlobs) {
		var files;
		// if no globs passed use config glob
		if (fileGlobs.length === 0) { 
			fileGlobs = path.resolve(this.config.yaml.src); 
		}
		files = _fileGlobber(fileGlobs);
		this.yamlFiles(files);
		return this.docFiles(path.resolve(this.config.yamlDocumented + '*.yaml'));
	},


	lintGlobs: function () {
		console.log('TODO: Impliment this.');
	}
};
