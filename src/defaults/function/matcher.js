'use strict';
/*jshint -W030 */

var _s = require('./vendor/underscore.string.min.js'),

	parseAstSubString = function(ast, subAstString) {
		var astString = JSON.stringify(ast, null, 2);

		return astString.indexOf(subAstString) > -1;
	},
	
	hasReturn = function(body) {
		var hasReturn = false;
		
		body.forEach(function(subAst) {
			if (subAst.type === 'ReturnStatement') {
				hasReturn = true;
			}
		});
		
		return hasReturn;
	},
	
	formatParam = function(name) {
		return '@param {<type>} ' + name + ' - ' + '<description>';
	},
	
	formatReturn = function() {
		return '@returns {<type>} - <description>';
	};
	
	
require('./vendor/rx-array.js');

module.exports = function(ast) {
	var json = [],
	
		mixinFunctions = [ast].
			filter(function (ast) {
				return  (
					ast.type === 'Property' &&
					ast.value.type === 'FunctionExpression' &&
					ast.key.type === 'Identifier' &&
					ast.key.name !== 'constructor' // filter named constructors
				);
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
								return _formatParam(param.name);
							}),
						_hasReturn(property.value.body.body) ? [_formatReturn()] : []
					].mergeAll()
				};
			}),
		
		functionExpressions = [ast].
			filter(function (ast) {
				return (
					ast.type === 'ExpressionStatement' &&
					ast.expression.type === 'AssignmentExpression' &&
					ast.expression.right.type === 'FunctionExpression' &&
					ast.expression.left.object.type !== 'ThisExpression' 
				);
			}).
			map(function(ast) {
			 	var left = ast.expression.left,
			 		right = ast.expression.right,
			 		functionJson;
			 		
			 	functionJson = {
			 		name: left.property ? left.property.name : left.property.object,
			 		tags: [
			 			right.params.
			 				map(function(params) {
			 					return _formatParam(params.name);
			 				}),
			 			right.body.body[0].type === 'ReturnStatement' ?
			 				[_formatReturn()] : []
			 		].mergeAll()
			 	};
			 	
				return functionJson;
			});
			
 	if (mixinFunctions.length > 0) {
 		return mixinFunctions.pop();
 	}
 	
 	if (functionExpressions.length > 0) {
 		return functionExpressions.pop();
 	}
	
	return false;
};