'use strict';

// Dependencies
//-----------------------------------------
var path 			= require('path'),
	_ 				= require('lodash'),
	_s 				= require('underscore.string'),
	// Private Variables
	_recursionDepth = 0;
	

module.exports = {
	
	init: function (options) {
		options = options || {};
		this.matchers = options.matchers;
	},
	
	// iterate the `matchers` object and call each
	// validation function with the current ast branch. Return
	// the syntax name of the first match.
	syntaxToDocument: function (branch) {
		var syntaxTargets 	= _.keys(this.matchers),
			results 		= false,
			self 			= this,
			syntaxJson;

		if (_.isNull(branch)) { return; }

		_.each(syntaxTargets, function (syntaxTarget) {
			syntaxJson = self.matchers[syntaxTarget](branch);
			
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
		
		// recursion e-break
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
		// we need a totaly blank object (with no
		// constructor, so we don't have name collision.)
		var results = Object.create( null );
		
		// results['class'] = {
		// 	name: 'name'
		// };

		this.parseBranch(JSON.parse(syntaxTree), results);

		return JSON.stringify(results, null, 2);
	}
};