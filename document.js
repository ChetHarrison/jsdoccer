'use strict';

var production = true;

var fs = require('fs'),
	path = require('path'),
	esprima = require('esprima'),
	_ = require('lodash'),

	Lookup = require('./lookup.js'),

	filename = process.argv[2],

	configFile = __dirname + '/.jsdoccerrc',

	config = JSON.parse(fs.readFileSync(configFile, 'utf8')),

	jsPath = config.js.src,

	astPath = config.ast.dest,

	yamlPath = config.yaml.dest,

	filesToDocument = fs.readdirSync(jsPath),

	getFullJsPath = function (filename) {
		return path.join(jsPath + filename);
	},

	getFullAstPath = function (filename) {
		return path.join(astPath + path.basename(filename, '.js') + '.json');
	},

	getFullYamlPath = function (filename) {
		console.log(path.join(yamlPath + path.basename(filename, '.js') + '.yaml'));
		return path.join(yamlPath + path.basename(filename, '.js') + '.yaml');
	},

	createSyntaxTree = function (file) {
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

	saveSyntaxTree = function (ast, filename) {
		var fullOutputPath = getFullAstPath(filename);
		fs.writeFileSync(fullOutputPath, JSON.stringify(ast, null, 2));
		console.log('Saving syntax tree: ' + fullOutputPath);
	},

	saveDocYaml = function (docYaml, filename) {
		var fullOutputPath = getFullYamlPath(filename);
		fs.writeFileSync(fullOutputPath, docYaml);
		console.log('Saving document YAML: ' + fullOutputPath);
	},

	fileFilters = config.fileFilters,

	documentFile = function (filename) {
		var filterThis = false;

		_.each(fileFilters, function(fileFilter) {
			if (_.contains(fileFilter, filename)) filterThis = true;
		});
		if (filterThis) return;

		var syntaxTree, lookup, docYaml;

		syntaxTree = createSyntaxTree(getFullJsPath(filename));

		if (production) {
			saveSyntaxTree(syntaxTree, filename);
		}

		// Play with the syntaxTree
		lookup = new Lookup({
			syntaxTree: syntaxTree
		});

		docYaml = lookup.parse();
		saveDocYaml(docYaml, filename);
	};

// check the input folder for target js files.
if (filesToDocument.length > 0) {
	filesToDocument.forEach(documentFile);
}
// bad usage
else {
	console.warn('Or for batch processing save your js files in ' + jsPath);
	process.exit(1);
}
