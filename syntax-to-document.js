'use strict';

// Private functions
//-----------------------------------------
// Use this function to match blocks of AST JSON
var _parseAstSubString = function(ast, subAstString) {
		var astString = JSON.stringify(ast, null, 2);

		return astString.indexOf(subAstString) > -1;
	},
	
	_hasReturn = function(body) {
		var hasReturn = false;
		
		body.forEach(function(subAst) {
			if (subAst.type === 'ReturnStatement') {
				hasReturn = true;
			}
		});
		
		return hasReturn;
	};
	
require('./rx-array.js');

// add a category of syntax you would like to document
// and assign it a function that will take a branch of
// the AST search for target conditions and return a
// JSON object that will be passed to the YAML template
// of the same (sluggifyed) class name.
//
// Example: `mySyntax` category would pass the JSON to 
// `my-syntax.tpl` in the templates directory specified
// in `.jsdoccerrc` config file.
//
// I highly recomend you use the `rx-array.js`
// map/reduce extentions to the `Array` prototype to 
// to parse the AST and produce the JSON argument you
// will pass to your templates. Processing JS in a 
// template is messy business so clean it up here.
//
// **Note: as much of the syntax you will want to 
// document will inevitably collide with reserve words
// I recomend using the plural ex. `functions` instead
// of `function`.**



module.exports = {
		// General documentation cases.
		modules: function(ast) {
			return ast.moduleName;
		},



		constructors: function(ast) {
			// Two casses 
			// 1) Named constructors,: search for methods named
			// constructor 
			// 2) Anonymous constructors: find methods with the
			// assigned to capitalized objects or properites.
			var json = false;
			
			// Named Constructors
			if (ast.type === 'Property' &&
				ast.value.type === 'FunctionExpression' &&
				ast.key.type === 'Identifier' &&
				ast.key.name === 'constructor') {
				
				json = [ast].
					filter(function(ast) {
						return ast.type === 'Property' &&
							ast.value.type === 'FunctionExpression' &&
							ast.key.type === 'Identifier' &&
							ast.key.name === 'constructor';
					}).
					map(function(property) {
					return {
						tags: [property.key.name.indexOf('_') === 0 ? ['@api private'] : ['@api public'],
							property.value.params.
							filter(function (param) {
								return param.type === 'Identifier';
							}).
							map(function (param) {
								return '@param {<type>} ' + param.name + ' - ';
							})
						].mergeAll()  // here's that mergeAll
					};
				});
			
			} else {
				
				json = [ast].
					filter(function(exp) {
						return exp.type === 'AssignmentExpression' &&
							exp.left.type === 'MemberExpression' &&
							exp.left.object.type === 'Identifier' &&
							exp.left.property.type === 'Identifier' &&
							exp.right.type === 'FunctionExpression' &&
							exp.left.property.name[0] === exp.left.property.name[0].toUpperCase();
					}).
					map(function(exp) { return exp.right; }).
					map(function(exp) {
						return {
							tags: [
								['@api public'],
								exp.params.
								filter(function (param) {
									return param.type === 'Identifier';
								}).
								map(function (param) {
									return '@param {<type>} ' + param.name + ' - ';
								})
							].mergeAll()  // here's that mergeAll
						};
					});
			}
		
			if (json.length > 0) {
				return json.pop();
			}
			
			return false;
		},
		
		
		
		properties: function(ast) {
			var json = false;
			
			json = [ast].
				filter(function (ast) {
					return ast.type === 'ExpressionStatement' &&
						ast.expression.type === 'AssignmentExpression' &&
						ast.expression.operator === '=' &&
						ast.expression.left.type === 'MemberExpression' &&
						ast.expression.left.object.type === 'ThisExpression';
				}).
				map(function (ast) {
					return {
						name: ast.expression.left.property.name
					};
				});
				
			if (json.length > 0) {
				return json.pop();
			}
			
			return false;
		},



		functions: function(ast) {
			var json = [ast].
				filter(function (ast) {
					return ast.type === 'Property' &&
						ast.value.type === 'FunctionExpression' &&
						ast.key.type === 'Identifier' &&
						ast.key.name !== 'constructor'; // filter named constructors
				}).
				map(function(property) {
					return {
						name: property.key.name,
						tags: [
							property.key.name.indexOf('_') === 0 ? ['@api private'] : ['@api public'],
							property.value.params.
								filter(function (param) {
									return param.type === 'Identifier';
								}).
								map(function (param) {
									return '@param {<type>} ' + param.name + ' - ';
								}),
							_hasReturn(property.value.body.body) ? ['@returns {<type>} -'] : []
						].mergeAll()
					};
				});
				
			if (json.length > 0) {
				return json.pop();
			}
			
			return false;
		},



		events: function(ast) {

            var json = [ast].
	            	filter(function(exp) {
	            		return exp.type === 'ExpressionStatement' &&
	            			exp.expression.type &&
			            	exp.expression.type === 'CallExpression' &&
			            	exp.expression.callee &&
			            	exp.expression.callee.object &&
			            	exp.expression.callee.object.type &&
			            	exp.expression.callee.object.type === 'ThisExpression' &&
			            	exp.expression.callee.property &&
			            	exp.expression.callee.property.type === 'Identifier' &&
			            	exp.expression.callee.property.name === 'triggerMethod';
		            }).
		            map(function(exp) {
		            	return {
		            		exp: exp,
		            		eventName: exp.expression.arguments.
			            		filter(function(arg) {
			            			return arg.type === 'Literal';
			            		}).
			            		map(function(arg) {
			            			return arg.value;
			            		}).pop()
		            	};
		            }).
		            filter(function(obj) {
		            	return obj.eventName;
		            }).
		            map(function(obj) {
		            	return { name: obj.eventName };
		            });
            	
            if (json.length > 0) {
				return json.pop();
			}
			
			return false;
		}
	};