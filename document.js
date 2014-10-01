'use strict';

var production = true;

var fs = require('fs'),
	path = require('path'),
	esprima = require('esprima'),
	_ = require('lodash'),

	Lookup = require('./lookup.js'),

	filename = process.argv[2],

	inputPath = 'input/js/',

	outputPath = 'output/',

	filesToDocument = fs.readdirSync(inputPath),

	getFullInputPath = function (filename) {
		return path.join(inputPath + filename);
	},

	getFullOutputPath = function (filename) {
		return path.join(outputPath + path.basename(filename, '.js') + '.json');
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

	saveSyntaxTree = function (json, filename) {
		var fullOutputPath = getFullOutputPath(filename);
		fs.writeFileSync(fullOutputPath, JSON.stringify(json, null, 2));
		console.log('Saving syntax tree: ' + fullOutputPath);
	},

	// TODO: add to config
	fileFilter = ['.DS_Store'],

	documentFile = function (filename) {
		if (_.contains(fileFilter, filename)) return;

		var tree, lookup, bodyNodes, typeMap;

		tree = createSyntaxTree(getFullInputPath(filename));

		if (production) {
			saveSyntaxTree(tree, filename);
		}

		// Play with the tree
		lookup = new Lookup({
			syntaxTree: tree
		});

		console.log(lookup.parse());
	};

// var tester = new Lookup();
// 	console.log(tester.test());

// check for command line for target js file arguments.
if (process.argv.length >= 4) {
	console.log('TODO: take more than one arg. right now it only takes one at the command line.');
	process.exit(1);
} else if (process.argv.length >= 3) {
	documentFile(filename);
}
// check the input folder for target js files.
else if (filesToDocument.length > 0) {
	filesToDocument.forEach(documentFile);
}
// bad usage
else {
	console.log('Usage: node ' + process.argv[1] + ' FILENAME');
	console.log('Or for batch processing save your js files in ' + inputPath);
	process.exit(1);
}
