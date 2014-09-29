'use strict';

var _ = require('lodash'),

	escodegen = require('escodegen'),

	// yaml templates
	functionDeclarationTpl = require('./templates/function-declaration.tpl'),

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
			attributes: ['id', 'params'],
			code: ['body']
		}
	},

	// formating
	tab = '  ',
	nl = '\n',
	yaml = '',
	recursionDepth = 0,
	syntax = '',

	_getTemplateName = function(type) {
		// TODO: impliment this.
		return 'functionDeclarationTpl';
	},

	// private functions
	// returns a string of white space for indentation.
	_getTabs = function(count) {
		var tabs = _.times(count, function() { 
				return '  ';
			});
		return tabs.join('');
	},

	// main recursive logic
	_parseBranch = function(branch, results, foundTarget) {
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
					// Create some new storage for our target so we don't 
					// clutter up the resuts storage.
					var targetResults = [];
					relevantSyntax[attribute] = _parseBranch(branch[attribute], targetResults, true);

				});

				// Generate code for any types referenced in the `code` parameter
				// of the config.
				_.each(targetSyntaxConfig.code, function(attribute) {
					// Create some new storage for our target so we don't 
					// clutter up the resuts storage.
					relevantSyntax[attribute] = escodegen.generate(branch[attribute]);
				});

				results.push(relevantSyntax);
			}

			// current value is an array so recurse
			// with members
			if (_.isArray(value)) {
				_.each(value, function(member) {
					_parseBranch(member, results, foundTarget);
				})
			}

			// current value is an object so recurse
			// with the object
			else if (_.isPlainObject(value)) {
				_parseBranch(value, results, foundTarget);
			}

			// Esprima nodes with an "Identifier" type
			// indicate names declared in your code. 
			else if (foundTarget && key === 'type' && value === 'Identifier') {
				results.push(branch.name);
			}
		});

		recursionDepth--;
		return results;
	},

	_jsonToYaml = function(jsonArray) {
		var yaml = [],
			results = '';

		yaml = 'fucj';
		_.each(jsonArray, function(json) {		
			results += _.template(functionDeclarationTpl, {'id': json.id});
			results += '\n';
			return 'what'
		});

		console.log(yaml);

		return yaml;
	};

_.extend(Lookup.prototype, {

	// Walk the AST building a yaml string of whitelisted
	// syntax.
	parse: function () {

			// this will collect the relevant data.
		var results = [], 
			// this a flag that will tell the parser to
			// start collecting data we are interested in.
			foundTarget = false,

			targets = _parseBranch(this.bodyNodes, results, foundTarget);

			console.log(targets); targets;

		return _jsonToYaml(targets);
	}

});

module.exports = Lookup;
