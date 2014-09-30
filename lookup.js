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

	// private functions
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

			// console.log(defaultSyntaxWhitelist);
			// console.log(defaultSyntaxWhitelist[value]);

			// TODO: reference the Lookup instance's whitelist
			var targetSyntaxConfig;
			// we have to check hasOwnProperty for collisions like 'constructor'
			if (defaultSyntaxWhitelist.hasOwnProperty(value)) {
				targetSyntaxConfig = defaultSyntaxWhitelist[value];
			}
			// console.dir(targetSyntaxConfig);
			if (targetSyntaxConfig) {
				console.log('found target ' + value);
				console.log(defaultSyntaxWhitelist);
				console.dir(targetSyntaxConfig);
				var relevantSyntax = {};

				// type the whitelisted syntax
				relevantSyntax['type'] = value;

				// console.log(value);
				// console.log(key);
				// console.log(targetSyntaxConfig);
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
				console.log("pushing target syntax");
				console.log(relevantSyntax);
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
				console.log("pushing identifier");
				console.log(branch.name);
				results.push(branch.name);
			}
		});

		recursionDepth--;
		return results;
	},

	_getTemplateName = function(type) {
		var path = _s.dasherize(type);
		path = path[0] === '-' ? path.substr(1) : path;
		path = config.yaml.templates + '/' + path + '.tpl';
		return path;
	},

	_getTemplate = function(type) {
		// TODO: Make this more robust with Node Path lib
		var filename = _getTemplateName(type),
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
		console.log(defaultSyntaxWhitelist['constructor']);

			// this will collect the relevant data.
		var results = [], 
			// this a flag that will tell the parser to
			// start collecting data we are interested in.
			foundTarget = false,

			targets = _parseBranch(this.bodyNodes, results, foundTarget);

			console.log(targets);

		return _jsonToYaml(targets);
	}

});

module.exports = Lookup;
