'use strict';

var _ = require('lodash'),

	// constructor
	Lookup = function (options) {
		options = options || {};

		this.syntaxTree = options.syntaxTree || {};

		this.syntaxWhitelist = options.syntaxWhitelist || defaultSyntaxWhitelist;

		this.bodyNodes = this.syntaxTree.body || [];
	},

	// Some default config. For each type of
	// syntax you need tell it what attributes
	// you would like to document
	defaultSyntaxWhitelist = {
		// This would parse a function name and it's 
		// parameter names
		FunctionDeclaration: {
			attributes: ['id', 'params']
		}
	},

	// formating
	tab = '  ',
	nl = '\n',
	yaml = '',
	recursionDepth = 0,
	syntax = '',

	// private functions
	// returns a string of white space for indentation.
	_getTabs = function(count) {
		// TODO: REMOVE THIS HACK
		count = count - 5;
		var tabs = _.times(count, function() { 
				return '  ';
			});
		return tabs.join('');
	},

	// main recursive logic
	_parseBranch = function(branch, targetSyntax, foundTarget) {
		var keys = Object.keys(branch),
			maxDepth = 50;
		
		recursionDepth++;

		// recursion emergency break!
		if (recursionDepth > maxDepth) {
			console.warn('Lookup._parseBranch(): Exceeded max recursion depth.');
			return;
		} 
		
		_.each(keys, function (key) {
			var value = branch[key];

			// TODO: reference the Lookup instance's whitelist
			var targetSyntaxConfig = defaultSyntaxWhitelist[value];

			if (targetSyntaxConfig) {
				var relevantSyntax = {};

				// type the whitelisted syntax
				relevantSyntax['type'] = value;

				// grab disired fields declared in the syntaxWhitelist
				_.each(targetSyntaxConfig.attributes, function(attribute) {
					var data = _parseBranch(branch[attribute], targetSyntax, true);
					console.log('here comes yor data');
					console.log(data);
					console.log('done with your data');
					relevantSyntax[attribute] = data;
				});

				targetSyntax.push(relevantSyntax);
			}

			// current value is an array so recurse
			// with members
			if (_.isArray(value)) {
				_.each(value, function(member) {
					_parseBranch(member, targetSyntax, foundTarget);
				})
			}

			// current value is an object so recurse
			// with the object
			else if (_.isPlainObject(value)) {
				_parseBranch(value, targetSyntax, foundTarget);
			}

			// Esprima nodes with an "Identifier" type
			// indicate names declared in your code. 
			else if (foundTarget && key === 'type' && value === 'Identifier') {
				targetSyntax.push(branch.name);
			}
		});

		recursionDepth--;
		return targetSyntax;
	};

_.extend(Lookup.prototype, {

	// Walk the AST building a yaml string of whitelisted
	// syntax.
	parse: function () {
		var targetSyntax = [],
			foundTarget = false;
		return _parseBranch(this.bodyNodes, targetSyntax, foundTarget);
	}

});

module.exports = Lookup;
