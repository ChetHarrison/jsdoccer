'use strict';

// Dependencies
//-----------------------------------------
var fs 					= require('fs-extra'),
	path 				= require('path'),
	esprima 			= require('esprima'),
	_ 					= require('lodash'),
	// private 
	// delegate declarations
	_astGenerator 		= require('./lib/ast-generator.js'),
	_astToDocJson 		= require('./lib/ast-to-doc-json.js'),
	_docJsonToDocYaml 	= require('./lib/doc-json-to-doc-yaml.js'),
	_prepareYaml		= require('./lib/prepare-yaml.js'),
	_generateDocs		= require('./lib/generate-docs.js'),
	
	// file path configuration the "setup" directory will be copied
	// to the project root.
	_config = {
		syntaxMatchers: 	'/jsdoccer/syntax-matchers.js',
		setUpSrc: 			'/../setup/',
		setUpDest: 			'jsdoccer/',
		yamlTemplates: 		'jsdoccer/templates/yaml/',
		handlebarsTemplate: 'jsdoccer/templates/jsdoc/class.hbs',
		ast: 				'jsdoccer/generated-files/ast/',
		docJson: 			'jsdoccer/generated-files/doc-json/',
		json: 				'jsdoccer/generated-files/json/',
		yamlStubbed: 		'jsdoccer/generated-files/yaml/stubbed/',
		yamlDocumented: 	'jsdoccer/generated-files/yaml/documented/',
		htmlDocumentation: 	'jsdoccer/documentation/'
	};


// API
//-----------------------------------------
module.exports = {
	
	// set object state
	// Need to be able to configure: 
	//   * output dir path
	init: function init(options) {
		var syntaxMatchers, syntaxMatchersPath, setUpSrcPath;
      		
		options = options || {};
		this.config = options.config;
		syntaxMatchersPath = path.resolve(process.cwd(), this.config.jsToDocument.dest + _config.syntaxMatchers);
		setUpSrcPath = path.resolve(__dirname + _config.setUpSrc);
		// check to see if we are set up
		try {
			syntaxMatchers = require(syntaxMatchersPath);
		}
		catch (err) {
			console.log('No "syntax-matchers.js" found. Setting up defaults.');
			fs.copySync(setUpSrcPath, path.resolve(this.config.jsToDocument.dest + _config.setUpDest));
			// github won't commit empty folders so we need to make those
			// by hand
			fs.mkdirSync(path.resolve(this.config.jsToDocument.dest + 'jsdoccer/generated-files/'));
			fs.mkdirSync(path.resolve(this.config.jsToDocument.dest + _config.ast));
			fs.mkdirSync(path.resolve(this.config.jsToDocument.dest + _config.docJson));
			fs.mkdirSync(path.resolve(this.config.jsToDocument.dest + _config.json));
			fs.mkdirSync(path.resolve(this.config.jsToDocument.dest + 'jsdoccer/generated-files/yaml/'));
			fs.mkdirSync(path.resolve(this.config.jsToDocument.dest + _config.yamlStubbed));
			fs.mkdirSync(path.resolve(this.config.jsToDocument.dest + _config.yamlDocumented));
			syntaxMatchers = require(syntaxMatchersPath);
		}
		
		_astToDocJson.init({
			syntaxMatchers: syntaxMatchers
		});
		
		_docJsonToDocYaml.init({
			templates: path.resolve(this.config.jsToDocument.dest + _config.yamlTemplates),
			dest: path.resolve(this.config.jsToDocument.dest + this.config.jsToDocument.dest)
		});
		
		_prepareYaml.init({
			filesToFilter: options.config.filesToFilter,
			files: {
				src: path.resolve(this.config.jsToDocument.dest + _config.yamlDocumented),
				dest: path.resolve(this.config.jsToDocument.dest + _config.docJson)
			}
		});
		
		_generateDocs.init({
			files: {
				src: path.resolve(this.config.jsToDocument.dest + _config.docJson),
				dest: path.resolve(this.config.jsToDocument.dest + _config.htmlDocumentation)
			},
			handlebarsTemplate: path.resolve(this.config.jsToDocument.dest + _config.handlebarsTemplate)
		});
		
	},
	
	// utilities
	saveFile: function(data, file, filepath, extention) {
		var dest = path.resolve(this.config.jsToDocument.dest + filepath + path.basename(file, '.js') + extention);
		console.log(filepath);
		
		console.log('-----Saving to :' + dest);
		fs.writeFileSync(dest, data);
	},
	
	
	// control
	generateStubbedDocYamlFile: function (file) {
		var syntaxTree, lookup, json, docYaml;
		console.log('howdy');
		// gard: filter files listed in config
		if (_.contains(this.config.filesToFilter, file)) { return; }
		// generate AST
		syntaxTree = _astGenerator.createSyntaxTree(file);
		this.saveFile(JSON.stringify(syntaxTree, null, 2), file, _config.ast, '.ast');
		
		// filter AST and generate syntax target JSON
		_astToDocJson.setFilename(file);
		json = _astToDocJson.parse(syntaxTree);
		this.saveFile(JSON.stringify(json, null, 2), file, _config.json, '.json');
	
		// generate document YAML
		docYaml = _docJsonToDocYaml.convert(json);
		this.saveFile(docYaml, file, _config.yamlStubbed, '.yaml');
	},
	
	
	generateStubbedDocYamlFiles: function (files) {
		console.log('in generateStubbedDocYamlFiles.');
		_.each(files, function(file) {
				console.log(file);
				this.generateStubbedDocYamlFile(file);
				console.log('post');
			}, this
		);
		return files.length;
	},
	
	
	prepareYaml: function () {
		return _prepareYaml.prepare();
	},
	
	
	generateDoc: function () {
		return _generateDocs.generate();
	},
	
	
	lintDocumentJson: function() {
		console.log('TODO: Impliment this.');
	}
};
