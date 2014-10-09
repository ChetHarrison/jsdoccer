'use strict';

// NPM Dependencies
//-----------------------------------------
var fs = require('fs'),

	path = require('path'),

	_ = require('lodash'),

	_s = require('underscore.string'),
	
	indentString = require('indent-string'),


	// Local Dependencies
	//-----------------------------------------
	configFile = __dirname + '/.jsdoccerrc',

	config = JSON.parse(fs.readFileSync(configFile, 'utf8')),

	syntaxToDocument = require(config.syntaxToDocument.src),



	// Constructor
	//-----------------------------------------
	Lookup = function (options) {
		options = options || {};

		if (!options.syntaxTree) {
			throw new Error('lookup.js#constructor: requires a syntaxt tree.');
		}

		this.syntaxTree = options.syntaxTree;

		this.filename = options.filename || 'No filename was provided.';

		this.syntaxToDocument = options.syntaxToDocument || syntaxToDocument;

		if (!this.syntaxToDocument) {
			throw new Error('lookup.js#constructor: requires a syntaxt-to-document.js file.');
		}
	},



	// iterate the `syntaxToDocument` object and call each
	// validation function with the current ast branch. Return
	// the syntax name of the first match.
	_syntaxToDocument = function (branch) {
		// TODO: Pull syntaxToDocument from Lookup instance
		var syntaxTargets = _.keys(syntaxToDocument),

			results = false,

			syntaxJson;


		if (_.isNull(branch)) {
			return;
		}


		_.each(syntaxTargets, function (syntaxTarget) {

			syntaxJson = syntaxToDocument[syntaxTarget](branch);

			if (syntaxJson) {
				results = {
					type: syntaxTarget,
					ast: syntaxJson
				};
			}

		});


		return results;
	},



	// Private Functions
	//-----------------------------------------
	_recursionDepth = 0,

	_parseBranch = function (branch, results) {

		var keys = _.keys(branch),

			maxDepth = 50,

			syntaxObject = _syntaxToDocument(branch);

		// recursion emergency break!
		_recursionDepth++;

		if (_recursionDepth > maxDepth) {

			console.warn('Lookup._parseBranch(): Exceeded max recursion depth.');


			return;
		}


		// Does current childBranch need to be documented?
		if (syntaxObject) {

			// Check to see if this is a new syntax category and add
			// it to the results if it isn't.
			if (!results[syntaxObject.type]) {

				results[syntaxObject.type] = [];
			}

			results[syntaxObject.type].push(syntaxObject.ast);
		}


		_.each(keys, function (key) {

			var childBranch = branch[key];

			// Current childBranch is an array so recurse
			// with members.
			if (_.isArray(childBranch)) {

				_.each(childBranch, function (sibling) {

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




	_getTemplateName = function (type) {
		var path = _s.dasherize(type);

		path = path[0] === '-' ? path.substr(1) : path;

		path = config.yaml.templates + '/' + path + '.tpl';


		return path;
	},



	_getTemplate = function (type) {
		// TODO: Make this more robust with Node Path lib
		var filename = _getTemplateName(type),

			fs = require('fs'),

			file = __dirname + 'filename';


		return fs.readFileSync(filename, 'utf8');
	},



	_jsonToYaml = function (json) {
		var yaml = '',

			syntaxTypes = _.keys(json);

		_.each(syntaxTypes, function (type) {

			var template = _getTemplate(type),

				syntaxJsons = json[type];

			// add type category
			yaml += type + '\n';

			_.each(syntaxJsons, function (syntaxJson) {

				yaml += indentString(_.template(template, syntaxJson), ' ', 2);

				yaml += '\n';

			});

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
		// but first we want to add a special case to 
		// document the module from the the file name.
		var results = {
			modules: [{
				name: _s.classify(path.basename(this.filename, '.js'))
			}]
		};

		_parseBranch(this.syntaxTree, results);

		// console.log(JSON.stringify(results, null, 4));

		return results;
	},

	jsonToYaml: function (json) {
		return _jsonToYaml(json);
	}

});



module.exports = Lookup;
