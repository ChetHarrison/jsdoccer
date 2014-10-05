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


		_.each(fileFilters, function (fileFilter) {
			if (_.contains(fileFilter, filename)) {
				filterThis = true;
			}
		});

		if (filterThis) {
			return;
		}


		syntaxTree = _createSyntaxTree(_getFullJsPath(filename));

		_saveSyntaxTree(syntaxTree, filename);




		//-----------------------------------------

		var asts = [syntaxTree];
		
		var namespaceClass = asts.
		filter(function (ast) {
			return ast.type === 'Program';
		}).
		flatMap(function (ast) {
			return ast.body.
				filter(function (bodyNode) {
					return bodyNode.type === 'ExpressionStatement' &&
						bodyNode.expression.type === 'AssignmentExpression' &&
						bodyNode.expression.left.type === 'MemberExpression' &&
						bodyNode.expression.left.object &&
						bodyNode.expression.left.object.type === 'Identifier' &&
						bodyNode.expression.left.property &&
						bodyNode.expression.left.property.type === 'Identifier' &&
						bodyNode.expression.right.type !== 'FunctionExpression';
				}).
				map(function (bodyNode) {
					return {
						namespace: bodyNode.expression.left.object.name,
						class: bodyNode.expression.left.property.name
					};
				});
			});
		
		console.log(namespaceClass);
		
		

		var allMethods = asts.
		filter(function (ast) {
			return ast.type === 'Program';
		}).
		flatMap(function (ast) {
			return ast.body.
			filter(function (body) {
				return body.type === 'ExpressionStatement';
			}).
			map(function (body) {
				return body.expression;
			}).
			filter(function (expression) {
				return expression.type === 'AssignmentExpression';
			}).
			map(function (expression) {
				return expression.right;
			}).
			filter(function (right) {
				return right.type === 'CallExpression';
			}).
			flatMap(function (right) {
				return right.arguments;
			}).
			filter(function (args) {
				return args.type === 'ObjectExpression';
			}).
			flatMap(function (args) {
				return args.properties;
			}).
			filter(function (properties) {
				return properties.type === 'Property' &&
					properties.value &&
					properties.value.params &&
					properties.key.type === 'Identifier';
			}).
			map(function (properties) {
				return {
					type: properties.key.name === 'constructor' ? 'constructor' : 'method',
					name: properties.key.name,
					tags: [
						// single values need to be in an array because mergeAll expects an array of 
						// arrays so this `[ '@api private', [ '@param foo' ] ]` bombs and 
						// `[ ['@api private'], [ '@param foo'] ]` works.
						properties.key.name.indexOf('_') === 0 ? ['@api private'] : ['@api public'],
						properties.value.params.
						filter(function (param) {
							return param.type === 'Identifier';
						}).
						map(function (param) {
							return '@param {<type>} ' + param.name + ' - ';
						})
					].mergeAll()  // here's that mergeAll
				};
			});
		});

		// console.log(allMethods);
		
		// console.log([["@api private"],["@param {<type>} triggerDef - "]].mergeAll());

		// var namedConstructors = allMethods
		// .filter(function(method) { return method.name === 'constructor'; });

		// console.log('Named Constructor');
		// console.log(namedConstructors);

		// var methods = allMethods
		// .filter(function(method) { 
		// 	return method.name !== 'constructor';
		// });

		// console.log('Methods');
		// console.log(methods);



		//-----------------------------------------

		// lookup = new Lookup({
		// 	syntaxTree: syntaxTree,

		// 	filename: filename
		// });

		// docYaml = lookup.parse();

		// _saveDocYaml(docYaml, filename);

		// // adding \n for readability
		// console.log();
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
