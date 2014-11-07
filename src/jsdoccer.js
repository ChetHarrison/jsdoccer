'use strict';

// Dependencies
//-----------------------------------------
var fs 					= require('fs-extra'),
	path 				= require('path'),
	esprima 			= require('esprima'),
	_ 					= require('lodash'),
	// private 
	// delegate declarations
	_astGenerator 		= Object.create( require('./lib/ast-generator.js') ),
	_astToDocJson 		= Object.create( require('./lib/ast-to-doc-json.js') ),
	_docJsonToDocYaml 	= Object.create( require('./lib/doc-json-to-doc-yaml.js') ),
	_prepareYaml		= Object.create( require('./lib/prepare-yaml.js') ),
	_generateDocs		= Object.create( require('./lib/generate-docs.js') ),
	
	// file path configuration the "setup" directory will be copied
	// to the project root.
	_config = {
		syntaxMatchers: 	'jsdoccer/syntax-matchers.js',
		setUpSrc: 			'./node_modules/jsdoccer/setup/',
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
	init: function init(options) {
		var syntaxMatchers;
		options = options || {};
		this.config = options.config;
		
		
		// check to see if we are set up
		try {
			syntaxMatchers = require('../../../' + _config.syntaxMatchers);
		}
		catch (err) {
			console.log(err);
			console.log('Current Working Dir: ' + process.cwd());
			console.log('No "syntax-matchers.js" found. Setting up defaults.');
			fs.copySync(_config.setUpSrc, _config.setUpDest);
			syntaxMatchers = require('../../../' + _config.syntaxMatchers);
		}
		
		_astToDocJson.init({
			syntaxMatchers: syntaxMatchers
		});
		
		_docJsonToDocYaml.init({
			templates: _config.yamlTemplates
		});
		
		_prepareYaml.init({
			filesToFilter: options.config.filesToFilter,
			files: {
				src: _config.yamlDocumented,
				dest: _config.docJson
			}
		});
		
		_generateDocs.init({
			files: {
				src: _config.docJson,
				dest: _config.htmlDocumentation
			},
			handlebarsTemplate: _config.handlebarsTemplate
		});
		
	},
	
	// utilities
	saveFile: function(data, file, filepath, extention) {
		var dest = path.join(filepath + path.basename(file, '.js') + extention);
		
		fs.writeFileSync('../../' + dest, data);
	},
	
	
	// control
	generateStubbedDocYamlFile: function (file) {
		var syntaxTree, lookup, json, docYaml;
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
		_.each(files, function(file) {
				this.generateStubbedDocYamlFile(file);
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
