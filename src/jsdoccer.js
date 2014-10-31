'use strict';
 
// Dependencies
//-----------------------------------------
var fs 					= require('fs'),
	path 				= require('path'),
	esprima 			= require('esprima'),
	_ 					= require('lodash'),
	// private 
	// delegate declarations
	_astGenerator 		= Object.create( require('./lib/ast-generator.js') ),
	_astToDocJson 		= Object.create( require('./lib/ast-to-doc-json.js') ),
	_docJsonToDocYaml 	= Object.create( require('./lib/doc-json-to-doc-yaml.js') );


// API
//-----------------------------------------
module.exports = {
	
	// set object state
	init: function init(options) {
		options = options || {};
		this.config = options.config;
		_astToDocJson.init({
			syntaxMatchers: options.config.syntaxMatchers.src
		});
		_docJsonToDocYaml.init({
			templates: options.config.yaml.templates
		});
	},
	
	
	saveFile: function(data, filename, filepath, extention) {
		var dest = path.join(filepath + path.basename(filename, '.js') + extention);
		
		fs.writeFileSync(dest, data);
	},
	
	
	generateStubbedDocYamlFile: function (filename) {
		var syntaxTree, lookup, json, docYaml;
	
		// gard: filter files listed in config
		if (_.contains(this.config.filesToFilter, filename)) { return; }
		// generate AST
		syntaxTree = _astGenerator.createSyntaxTree(filename);
		if (this.config.ast.save && this.config.ast.save === true) {
			this.saveFile(JSON.stringify(syntaxTree, null, 2), filename, this.config.ast.dest, '.ast');
		}
		// filter AST and generate syntax target JSON
		_astToDocJson.setFilename(filename);
		json = _astToDocJson.parse(syntaxTree);
		if (this.config.json.save && this.config.json.save === true) {
			this.saveFile(JSON.stringify(json, null, 4), filename, this.config.json.dest, '.json');
		}
		// generate document YAML
		docYaml = _docJsonToDocYaml.convert(json);
		this.saveFile(docYaml, filename, this.config.yaml.dest, '.yaml');
	},
	
	
	
	generateStubbedDocYamlFiles: function () {
		var self 			= this,
			filesToDocument = fs.readdirSync(this.config.js.src);
			
		if (filesToDocument.length > 0) {
			filesToDocument.forEach(function(file) { self.generateStubbedDocYamlFile(file); });
		}
		// bad usage
		else {
			console.warn('No js targets found to document in ' + this.config.js.src);
			process.exit(1);
		}
	},
	
	
	
	lintDocumentJson: function() {
		console.log('TODO: Impliment this.');
	}
};
