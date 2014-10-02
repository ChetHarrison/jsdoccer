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

	yamlPath = config.yaml.dest,

	filesToDocument = fs.readdirSync(jsPath),

	fileFilters = config.fileFilters,


	// Private functions
	//-----------------------------------------
	_getFullJsPath = function (filename) {

		return path.join(jsPath + filename);
	},



	_getFullAstPath = function (filename) {

		return path.join(astPath + path.basename(filename, '.js') + '.json');
	},



	_getFullYamlPath = function (filename) {

		return path.join(yamlPath + path.basename(filename, '.js') + '.yaml');
	},



	_createSyntaxTree = function (file) {
		var code = fs.readFileSync(file, 'utf8');

		console.log('Generating syntax tree: ' + file);


		return esprima.parse(code, {
			loc: false,
			range: false,
			raw: false,
			tokens: false,
			// TODO: if commets grab and insert into description.
			comment: false,
		});
	},



	_saveSyntaxTree = function (ast, filename) {
		var fullOutputPath = _getFullAstPath(filename);

		fs.writeFileSync(fullOutputPath, JSON.stringify(ast, null, 2));

		console.log('Saving syntax tree: ' + fullOutputPath);
	},



	_saveDocYaml = function (docYaml, filename) {
		var fullOutputPath = _getFullYamlPath(filename);

		fs.writeFileSync(fullOutputPath, docYaml);

		console.log('Saving document YAML: ' + fullOutputPath);
	},



	_documentFile = function (filename) {
		var filterThis = false,

			syntaxTree, lookup, docYaml;


		_.each(fileFilters, function(fileFilter) {
			if (_.contains(fileFilter, filename)) filterThis = true;
		});

		if (filterThis) return;


		syntaxTree = _createSyntaxTree(_getFullJsPath(filename));
		
		_saveSyntaxTree(syntaxTree, filename);


		lookup = new Lookup({
			syntaxTree: syntaxTree,
			
			filename: filename
		});

		docYaml = lookup.parse();

		_saveDocYaml(docYaml, filename);

		// adding \n for readability
		console.log();
	};


// Main Logic
//-----------------------------------------
// check the input folder for target js files.
if (filesToDocument.length > 0) {

	filesToDocument.forEach(_documentFile);
}
// bad usage
else {
	console.warn('No js targets found to document in ' + jsPath);

	process.exit(1);
}
