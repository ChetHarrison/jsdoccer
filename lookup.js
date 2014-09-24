'use strict';

var _ = require('lodash'),
	RxArray = require('./rx-array.js');
	
var Lookup = function (options) {
	// maps esprima to jsdoc
	var defaultConfig = {

	};

	this.syntaxTree = options.syntaxTree;

	this.config = options.config || defaultConfig;

	this.bodyNodes = this.syntaxTree.body || [];
}

_.extend(Lookup.prototype, {

	getNamespacedFunctionAssignments: function() {
		return this.bodyNodes.

			filter(function(node) { return node.type === 'ExpressionStatement'; }).

			map(function(node) { return node.expression }).

			filter(function(expression) {
				return (
					expression.type === 'AssignmentExpression' &&
					expression.operator === '='
				);
			}).

			filter(function(expression) { 
				return (
					expression.left.type === 'MemberExpression' &&
					expression.right.type === 'FunctionExpression'
				); 
			}).

			map(function(expression) { 
				return {
					namespace: expression.left.object.name,
					functionName: expression.left.property.name,
					params: expression.right.params.map(function(param) {
						return param.name;
					})
				}; 
			});
	}

});

module.exports = Lookup;