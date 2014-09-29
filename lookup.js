'use strict';


var fs = require('fs'),
	
	configFile = __dirname + '/.jsdoccerrc',

	// read .jsdoccerrc
	config = JSON.parse(fs.readFileSync(configFile, 'utf8')),

	_ = require('lodash'),

	escodegen = require('escodegen'),

	_s = require('underscore.string'),

	// constructor
	Lookup = function (options) {
		options = options || {};

		this.syntaxTree = options.syntaxTree || {};

		this.syntaxWhitelist = options.syntaxWhitelist || config.syntaxWhitelist || defaultSyntaxWhitelist;

		this.bodyNodes = this.syntaxTree.body || [];
	},

	// Some default config. For each type of
	// syntax you need tell it what attributes
	// you would like to document
	defaultSyntaxWhitelist = {
		// This would parse a function name, its 
		// parameter names, and its body code.
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

	_getTemplate = function(type) {
		// TODO: Make this more robust with Node Path lib
		var filename = config.yaml.templates + '/' + _s.dasherize(type).substr(1) + '.tpl',
			fs = require('fs'),
			file = __dirname + 'filename';
 
		return fs.readFileSync(filename, 'utf8');
	},

	_jsonToYaml = function(jsonArray) {
		var yaml = '';

		_.each(jsonArray, function(json) {	
			var template = _getTemplate(json.type);
			yaml += _.template(template, json);
			yaml += '\n';
		});

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

		return _jsonToYaml(targets);
	}

});

module.exports = Lookup;
