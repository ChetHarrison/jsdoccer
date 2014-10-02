'use strict';

// NPM Dependencies
//-----------------------------------------
var fs = require('fs'),

	_ = require('lodash'),

	_s = require('underscore.string'),


	// Local Dependencies
	//-----------------------------------------
	configFile = __dirname + '/.jsdoccerrc',

	config = JSON.parse(fs.readFileSync(configFile, 'utf8')),

	syntaxToDocument = require(config.syntaxToDocument.src),
	


	// Constructor
	//-----------------------------------------
	Lookup = function (options) {
		options = options || {};

		if (!options.syntaxTree) throw new Error('lookup.js#constructor: requires a syntaxt tree.');

		this.syntaxTree = options.syntaxTree;

		this.syntaxToDocument = options.syntaxToDocument || syntaxToDocument;

		if (!this.syntaxToDocument) throw new Error('lookup.js#constructor: requires a syntaxt-to-document.js file.');
	},



	// Private Functions
	//-----------------------------------------
	_recursionDepth = 0,

	_parseBranch = function(branch, results) {

		var keys = _.keys(branch),

			maxDepth = 50,

			syntaxToDocumentType = _syntaxToDocument(branch);


		// recursion emergency break!
		_recursionDepth++;

		if (_recursionDepth > maxDepth) {

			console.warn('Lookup._parseBranch(): Exceeded max recursion depth.');


			return;
		}


		// Does current childBranch need to be documented?
		if (syntaxToDocumentType) {

			var newSyntaxToDocumentAst = {};

			newSyntaxToDocumentAst[syntaxToDocumentType] = branch;

			results.push(newSyntaxToDocumentAst);
		}


		_.each(keys, function(key) {

			var childBranch = branch[key]

			// Current childBranch is an array so recurse
			// with members.
			if (_.isArray(childBranch)) {

				_.each(childBranch, function(sibling) {

					_parseBranch(sibling, results);

				});
			}

			// Current childBranch is an object so recurse
			// with the object.
			else if (_.isPlainObject(childBranch)) {

				_parseBranch(childBranch, results);
			}
		});

		_recursionDepth--;


		return results;
	},



	// iterate the `syntaxToDocument` object and call each
	// validation function with the current ast branch. Return
	// the syntax name of the first match.
	_syntaxToDocument = function(branch) {
		// TODO: Pull syntaxToDocument from Lookup instance
		var syntaxTargets = _.keys(syntaxToDocument),

			syntax = false;


		if (_.isNull(branch)) return;


		_.each(syntaxTargets, function(syntaxTarget) {

			if (syntaxToDocument[syntaxTarget](branch)) {

				syntax = syntaxTarget;
			}
		});


		return syntax;
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

			var docType = _.keys(json)[0],

				ast = json[docType],

				template = _getTemplate(docType);


			yaml += _.template(template, ast);

			yaml += '\n';
		});


		return yaml;
	};



// Methods
//-----------------------------------------
_.extend(Lookup.prototype, {

	// Walk the AST building a yaml string of whitelisted
	// syntax.
	parse: function () {
			// this will collect the relevant data.
		var results = [], 

			targets;

		targets = _parseBranch(this.syntaxTree, results);


		return _jsonToYaml(targets);
	}

});



module.exports = Lookup;
