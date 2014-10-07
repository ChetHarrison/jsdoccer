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
		
		// class types
		
		// assigned constructor and extended prototype
		// Marionette.Application = function(options) {...};
		// _.extend(Marionette.Application.prototype, Backbone.Events, {...});

		// Extended class with constructor property
		// Marionette.AppRouter = Backbone.Router.extend({
		// 	constructor: function(options) {...}
		// });

		// iife with methods added to passed class
		// (function(Marionette) {
		//   Marionette.bindEntityEvents = function(target, entity, bindings) {
		//     iterateEvents(target, entity, bindings, bindToFunction, bindFromStrings);
		//   };
		// }(Marionette);


		var asts = [syntaxTree],
		
			astBody = asts.
				filter(function (ast) { return ast.type === 'Program'; }).
				flatMap(function (ast) { return ast.body; }),
				
		 	//-----------------------------------------
		 	
		 	astBodyElements = function(ast) {
		 		return [ast].
					filter(function (ast) { return ast.type === 'Program'; }).
					flatMap(function (ast) { return ast.body; });
		 	},
		 	
		 	iifes = function(ast) {
		 		return astBodyElements(ast).
		 			filter(function(bodyElement) { 
		 				return bodyElement.type === 'ExpressionStatement' &&
		 					bodyElement.expression.type === 'CallExpression'; 
		 			}).
			 		map(function(bodyElement) { return bodyElement.expression; }).
			 		filter(function(exp) {
			 			return exp.callee.type === 'FunctionExpression';
			 		}).
			 		map(function(exp) {
			 			return {
			 				type: 'iife',
			 				globals: exp.callee.params.
			 					map(function(param) {
			 						return param.name;
			 					}),
			 				ast: exp
			 			};
			 		});
		 	},
		 	
		 	globals = function(ast) {
		 		return astBodyElements(ast).
			 		filter(function(bodyElement) { return bodyElement.type === 'ExpressionStatement'; }).
			 		map(function(bodyElement) { return bodyElement.expression; }).
			 		filter(function(exp) {
			 			return exp.type === 'AssignmentExpression' &&
							exp.left.type === 'MemberExpression' &&
							exp.left.object &&
							exp.left.object.type === 'Identifier';
					}).
					map(function(exp) {
						return {
							type: 'globals',
							global: exp.left.object.name,
							ast: exp
						};
					});
		 	};
		 	
		 	console.log(globals(syntaxTree));
		 	console.log(iifes(syntaxTree));
		 	
		 	//-----------------------------------------
		 	
		var globalNamespacedAssignedIifeWithFunctions = astBody.
		 		filter(function(bodyElement) { return bodyElement.type === 'ExpressionStatement'; }).
		 		map(function(bodyElement) { return bodyElement.expression; }).
		 		filter(function(exp) {
		 			return exp.type === 'AssignmentExpression' &&
						exp.left.type === 'MemberExpression' &&
						exp.left.object &&
						exp.left.object.type === 'Identifier' &&
						exp.left.property &&
						exp.left.property.type === 'Identifier' &&
						exp.right.type === 'CallExpression' &&
						exp.right.callee.type === 'FunctionExpression' &&
						exp.right.callee.body.type === 'BlockStatement';
		 		}).
		 		map(function(exp) {
		 			// console.log('-----');
		 			// console.log(exp.left.property.name);
		 			return {
		 				namespace: exp.left.object.name,
		 				class: exp.left.property.name,
		 				params: exp.right.arguments.
		 					map(function(args) {
		 						return args.name;
		 					}),
		 				attributes:  
		 					exp.left.property.name ===
		 						exp.right.callee.body.body.
		 							filter(function(body) {
		 								return body.type === 'FunctionDeclaration';
		 							}).
		 							map(function(body) {
		 								// console.log(body.id.name);
		 								return body.id.name;
		 							}) ? true : false
		 			};
		 		});
		 		
		 	// console.log(globalNamespacedAssignedIifeWithFunctions);
		 	
		 	//-----------------------------------------
			
			var namespaceAndClass = astBody.
				filter(function (bodyNode) {
					return bodyNode.type === 'ExpressionStatement' &&
						bodyNode.expression.type === 'AssignmentExpression' &&
						bodyNode.expression.left.type === 'MemberExpression' &&
						bodyNode.expression.left.object &&
						bodyNode.expression.left.object.type === 'Identifier' &&
						bodyNode.expression.left.property &&
						bodyNode.expression.left.property.type === 'Identifier' &&
						bodyNode.expression.right.type !== 'FunctionExpression';
				}),
				
			namespaces = namespaceAndClass.
				map(function (bodyNode) {
					return {
						namespace: {name: bodyNode.expression.left.object.name}
					};
				}),
				
			classes = namespaceAndClass.
				map(function (bodyNode) {
					return {
						class: {name: bodyNode.expression.left.property.name}
					};
				}),
				
				expressions = astBody.
					filter(function (body) {
						return body.type === 'ExpressionStatement';
					}).
					map(function (body) {
						return body.expression;
					}),
					
					assignments = expressions.
						filter(function (expression) {
							return expression.type === 'AssignmentExpression';
						}),
						
						membersToMembers = assignments.
							filter(function (expression) {
								return expression.left.type === 'MemberExpression' &&
									expression.right.type === 'MemberExpression';
							}).
							map(function (expression) {
								return {
									left: expression.left.object,
									right: expression.right.object
								};
							}),
						
					calls = expressions.
						filter(function (expression) {
							return expression.type === 'CallExpression';
						});
						
		// console.log('assignments');
		// console.log(assignments);
		// console.log('calls');
		// console.log(calls);
		// console.log(membersToMembers);
				
			// expressionAssignments = astBody.
			// 	filter(function (body) {
			// 		return body.type === 'ExpressionStatement';
			// 	}).
			// 	map(function (body) {
			// 		return body.expression;
			// 	}).
			// 	filter(function (expression) {
			// 		return expression.type === 'AssignmentExpression';
			// 	}),
				
			// namespacedFunctions = expressionAssignments.
			// 	filter(function (expression) {
			// 		return expression.left.type === 'MemberExpression' &&
			// 			expression.left.property &&
			// 			expression.left.property.type &&
			// 			expression.left.property.type === 'Identifier' &&
			// 			expression.right.type &&
			// 			expression.right.type === 'FunctionExpression';
			// 	}).
			// 	map(function (expression) {
			// 		var obj = {};
					
			// 		obj['function'] = {
			// 			name: expression.left.property.name,
			// 			tags: [
			// 				expression.left.property.name.indexOf('_') === 0 ? ['@api private'] : ['@api public'],
			// 				expression.right.params.
			// 				filter(function (param) {
			// 					return param.type === 'Identifier';
			// 				}).
			// 				map(function (param) {
			// 					return '@param {<type>} ' + param.name + ' - ';
			// 				})
			// 			].mergeAll()
								
			// 		};
			// 		return obj;
			// 	}),
				
			// namespacedFunctionParameters = expressionAssignments.
			// 	map(function (expression) {
			// 		return expression.right;
			// 	}).
			// 	filter(function (right) {
			// 		return right.type === 'MemberExpression' &&
			// 			right.property &&
			// 			right.property.type &&
			// 			right.property.type === 'Identifier';
			// 	}).
			// 	map(function (right) {
			// 		var obj = {};
					
			// 		obj['function'] = {
			// 			name: right.property.name
			// 		};
			// 		return obj;
			// 	}),
				
			// methods = expressionAssignments.
			// 	map(function (expression) {
			// 		return expression.right;
			// 	}).
			// 	filter(function (right) {
			// 		return right.type === 'CallExpression';
			// 	}).
			// 	flatMap(function (right) {
			// 		return right.arguments;
			// 	}).
			// 	filter(function (args) {
			// 		return args.type === 'ObjectExpression';
			// 	}).
			// 	flatMap(function (args) {
			// 		return args.properties;
			// 	}).
			// 	filter(function (properties) {
			// 		return properties.type === 'Property' &&
			// 			properties.value &&
			// 			properties.value.params &&
			// 			properties.key.type === 'Identifier';
			// 	}).
			// 	map(function (properties) {
			// 		var obj = {},
			// 			key = properties.key.name === 'constructor' ? 'constructor' : 'method';
						
			// 		obj[key] = {
			// 			name: properties.key.name,
			// 			tags: [
			// 				// single values need to be in an array because mergeAll expects an array of 
			// 				// arrays so this `[ '@api private', [ '@param foo' ] ]` bombs and 
			// 				// `[ ['@api private'], [ '@param foo'] ]` works.
			// 				properties.key.name.indexOf('_') === 0 ? ['@api private'] : ['@api public'],
			// 				properties.value.params.
			// 				filter(function (param) {
			// 					return param.type === 'Identifier';
			// 				}).
			// 				map(function (param) {
			// 					return '@param {<type>} ' + param.name + ' - ';
			// 				})
			// 			].mergeAll()  // here's that mergeAll
			// 		};
					
			// 		return obj;
			// 	});
				
			// console.log(JSON.stringify([namespaces, classes, methods, namespacedFunctions].mergeAll(), null, 4));
			// console.log(JSON.stringify([namespacedFunctions].mergeAll(), null, 4));
		



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
