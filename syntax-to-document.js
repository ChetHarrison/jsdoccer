'use strict';

// Private functions
//-----------------------------------------
// TODO: move these to a utility module so nobody modifys 
// them, at least unwitingly.
var _parseAstSubString = function(ast, subAstString) {
		var astString = JSON.stringify(ast, null, 2);

		return astString.indexOf(subAstString) > -1;
	},



	_parseMultiLineStrings = function(multiLineString) {

		return new Function(null, multiLineString);
	};



module.exports = {
		// General documentation cases.
		methods: function(ast) {

			return ast.type === 'Property' &&
				ast.value.type === 'FunctionExpression';
		},



		functions: function(ast) {

			return ast.type === 'FunctionDeclaration';
		},



		// Custom Backbone.Marionette cases.

		// TODO: Indentation matters so pull indentation 
		// style from config and create tool for multiline
		// strings like PHP """.
		applications: function(ast) {
			var target = 
				'{\n' +
				'  "type": "Program",\n' +
				'  "body": [\n' +
				'    {\n' +
				'      "type": "ExpressionStatement",\n' +
				'      "expression": {\n' +
				'        "type": "AssignmentExpression",\n' +
				'        "operator": "=",\n' +
				'        "left": {\n' +
				'          "type": "MemberExpression",\n' +
				'          "computed": false,\n' +
				'          "object": {\n' +
				'            "type": "Identifier",\n' +
				'            "name": "Marionette"\n' +
				'          },\n' +
				'          "property": {';

			return _parseAstSubString(ast, target);
		},



		classNames: function(ast) {

		}
	};