'use strict';
/*jshint -W030 */

require('rx-array');

module.exports = function(ast) {
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
		ast.key.name === 'constructors') {
		
		json = [ast].
			filter(function(ast) {
				return ast.type === 'Property' &&
					ast.value.type === 'FunctionExpression' &&
					ast.key.type === 'Identifier' &&
					ast.key.name === 'constructors';
			}).
			map(function(property) {
			return {
				tags: [property.key.name.indexOf('_') === 0 ? ['@api private'] : ['@api public'],
					property.value.params.
					filter(function (param) {
						return param.type === 'Identifier';
					}).
					map(function (param) {
						return '@param {<type>} ' + param.name + ' - ' + '<description>';
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
							return '@param {<type>} ' + param.name + ' - ' + '<description>';
						})
					].mergeAll()  // here's that mergeAll
				};
			});
	}

	if (json.length > 0) {
		return json.pop();
	}
	
	return false;
};