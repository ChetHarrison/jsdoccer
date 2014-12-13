'use strict';
/*jshint -W030 */

require('rx-array');

module.exports = function(ast) {
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
};