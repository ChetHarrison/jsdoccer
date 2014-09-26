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

// esprima map of type to detail field
var typeMap = {
	Program: {
		parseTags: ['body'],
		documentTags: []
	},

	VariableDeclaration: {
		parseTags: ['declarations'],
		documentTags: []
	},

	VariableDeclarator: {
		parseTags: ['id','init'],
		documentTags: []
	},

	id: {
		parseTags: ['Identifier'],
		documentTags: []
	},

	FunctionExpression: {
		parseTags: ['params'],
		documentTags: []
	},

	Identifier: {
		parseTags: [],
		documentTags: ['name']
	}

}

var tab = '  ';
var nl = '\n';
var yaml = '';

var parseBranch = function(tree) {

		// console.log('//------------------tree is now-----------------------');
		// console.log(tree);

		// collection
		if (_.isArray(tree)) {
			_.each(tree, function(item) {
				parseBranch(item)
			})
		}
		// node
		else {
			var type = typeMap[tree.type]
			// console.log('type is now ----');
			// console.log(type);

			if (type) {
				_.each(type.parseTags, function(tag) {
					// console.log('tag is ' + tag);
					parseBranch(tree[tag]);
				});

				yaml = yaml + tab;

				_.each(type.documentTags, function(tag) {
					yaml = yaml + tree[tag] + nl;
				});
			}
		}
		return yaml;
	}

_.extend(Lookup.prototype, {

	parse: function() {
		yaml = '';
		return parseBranch(this.bodyNodes);
	},

	getNamespacedAssignments: function(type) {
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
					expression.right.type === type
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