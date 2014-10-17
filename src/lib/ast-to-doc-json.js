'use strict';

// Dependencies
//-----------------------------------------
var _ 		= require('lodash'),
	path 	= require('path'),
	_s 		= require('underscore.string'),
	AstToDocJson;
	
// Constructor
//-----------------------------------------
AstToDocJson = function(options) {
	options = options || {};
	this.syntaxMatchers = options.syntaxMatchers;
};

// Private Variables
//-----------------------------------------
var	_recursionDepth = 0;

// functions
//-----------------------------------------
_.extend(AstToDocJson.prototype, {
	// iterate the `syntaxMatchers` object and call each
	// validation function with the current ast branch. Return
	// the syntax name of the first match.
	syntaxToDocument: function (branch) {
		var syntaxTargets 	= _.keys(this.syntaxMatchers),
			results 		= false,
			self 			= this,
			syntaxJson;

		if (_.isNull(branch)) { return; }

		_.each(syntaxTargets, function (syntaxTarget) {
			syntaxJson = self.syntaxMatchers[syntaxTarget](branch);
			if (syntaxJson) {
				results = {
					type: syntaxTarget,
					ast: syntaxJson
				};
			}
		});

		return results;
	},
	
	parseBranch: function (branch, results) {
		var keys 			= _.keys(branch),
			maxDepth 		= 50,
			self 			= this,
			syntaxObject 	= this.syntaxToDocument(branch);

		// recursion emergency break!
		_recursionDepth++;
		
		if (_recursionDepth > maxDepth) {
			console.warn('ast-to-doc-json.parseBranch(): Exceeded max recursion depth.');
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
					self.parseBranch(sibling, results);
				});
			}
			// Current childBranch is an object so recurse
			// with the object.
			else if (_.isPlainObject(childBranch)) {
				self.parseBranch(childBranch, results);
			}
		});

		_recursionDepth--;

		return results;
	},


	// Walk the AST building a yaml string of whitelisted
	// syntax.
	parse: function (syntaxTree) {
		// this will collect the relevant data.
		// but first we want to add a special case to 
		// document the module from the the file name.
		var results = {
			modules: [{
				name: _s.classify(path.basename(this.filename, '.js'))
			}]
		};

		this.parseBranch(syntaxTree, results);

		return results;
	}
	
});


// API
//-----------------------------------------
module.exports =AstToDocJson;