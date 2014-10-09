'use strict';

// NPM Dependencies
//-----------------------------------------
var fs = require('fs'),

	path = require('path'),

	esprima = require('esprima'),

	_ = require('lodash'),


	// Local Dependencies
	//-----------------------------------------
	Lookup = require('./lookup.js'),


	// private variables
	//-----------------------------------------
	filename = process.argv[2],

	configFile = __dirname + '/.jsdoccerrc',

	config = JSON.parse(fs.readFileSync(configFile, 'utf8')),

	jsPath = config.js.src,

	astPath = config.ast.dest,

	jsonPath = config.json.dest,

	yamlPath = config.yaml.dest,

	filesToDocument = fs.readdirSync(jsPath),

	fileFilters = config.fileFilters,
	
	Document = function() {
		this.name = 'I document things';
	};


_.extend(Document.prototype, {
	_createSyntaxTree: function (file) {
		var code = fs.readFileSync(file, 'utf8');


		return esprima.parse(code, {
			loc: false,
			range: false,
			raw: false,
			tokens: false,
			// TODO: if commets grab and insert into description.
			comment: false,
		});
	},
	
	
	_saveFile: function(data, filename, filepath, extention) {
		var dest = path.join(filepath + path.basename(filename, '.js') + extention);
		
		fs.writeFileSync(dest, data);

		console.log('save ' + extention + ': ' + dest);
	},



	_documentFile: function (filename) {
		var filterThis = false,

			syntaxTree, lookup, json, docYaml;


		_.each(fileFilters, function (fileFilter) {
			if (_.contains(fileFilter, filename)) {
				filterThis = true;
			}
		});

		if (filterThis) {
			return;
		}


		syntaxTree = this._createSyntaxTree(path.join(jsPath + filename));

		this._saveFile(JSON.stringify(syntaxTree, null, 2), filename, astPath, '.ast');

		lookup = new Lookup({
			syntaxTree: syntaxTree,

			filename: filename
		});

		json = lookup.parse();

		this._saveFile(JSON.stringify(json, null, 4), filename, jsonPath, '.json');

		docYaml = lookup.jsonToYaml(json);

		this._saveFile(docYaml, filename, yamlPath, '.yaml');

		// adding \n for readability
		console.log();
	},
	
	document: function () {
		var self = this;
		if (filesToDocument.length > 0) {

			filesToDocument.forEach(function(file) { self._documentFile(file); });
		}
		// bad usage
		else {
			console.warn('No js targets found to document in ' + jsPath);

			process.exit(1);
		}
	}
});



module.exports = new Document();
