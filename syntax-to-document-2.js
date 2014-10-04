'use strict';

// Private functions
//-----------------------------------------
// Use this function to match blocks of AST JSON
var _parseAstSubString = function(ast, subAstString) {
		var astString = JSON.stringify(ast, null, 2);

		return astString.indexOf(subAstString) > -1;
	},



	_parseMultiLineStrings = function(multiLineString) {

	};

require('./rx-array.js');

module.exports = {
		// General documentation cases.
		modules: function(ast) {
			return ast.moduleName;
		},



		constructors: function(ast) {

			return ast.type === 'Property' &&
				ast.value.type === 'FunctionExpression' &&
				ast.key.name === 'constructor';
		},



		anonymousConstructors: function(ast) {
			// case 1: Marionette.Application = function(options) {
			  // "type": "Program",
			  // "body": [
			  //   {
			  //     "type": "ExpressionStatement",
			  //     "expression": {
			  //       "type": "AssignmentExpression",
			  //       "operator": "=",
			  //       "left": {
			  //         "type": "MemberExpression",
			  //         "computed": false,
			  //         "object": {
			  //           "type": "Identifier",
			  //           "name": "Marionette"
			  //         },
			  //         "property": {
			  //           "type": "Identifier",
			  //           "name": "Application"
			  //         }
			  //       },
			  //       "right": {
			  //         "type": "FunctionExpression",
			  //         "id": null,
			  //         "params": [
			  //           {
			  //             "type": "Identifier",
			  //             "name": "options"
			  //           }
			  //         ],

			// could be pretty hard to do.

			// case 2: function Behavior(options, view) {
		},



		methods: function(ast) {

			return ast.type === 'Property' &&
				ast.value.type === 'FunctionExpression' &&
				ast.key.name !== 'constructor';
		},



		methodsWithReturns: function(ast) {
			var isReturnStatment = false;

			if (ast.type === 'Property' &&
				ast.value.type === 'FunctionExpression' &&
				ast.key.name !== 'constructor') {

				ast.value.body.body.forEach(function(subAst) {
					if (subAst.type === 'ReturnStatement') {isReturnStatment = true;}
				});
			}

			return isReturnStatment;
		},



		functions: function(ast) {
			var isReturnStatment = false;

			return ast.type === 'FunctionDeclaration';
		},



		functionsWithReturns: function(ast) {
			var isReturnStatment = false;

			if (ast.type === 'FunctionDeclaration') {
				ast.body.body.forEach(function(subAst) {
					if (subAst.type === 'ReturnStatement') {isReturnStatment = true;}
				});
			}

			return isReturnStatment;
		},



		events: function(ast) {
			// sample ast condition

			// "type": "CallExpression",
   //          "callee": {
   //            "type": "MemberExpression",
   //            "computed": false,
   //            "object": {
   //              "type": "ThisExpression"
   //            },
   //            "property": {
   //              "type": "Identifier",
   //              "name": "listenTo"
   //            }
   //          },
   //          "arguments": [
   //            {
   //              "type": "MemberExpression",
   //              "computed": false,
   //              "object": {
   //                "type": "ThisExpression"
   //              },
   //              "property": {
   //                "type": "Identifier",
   //                "name": "regionManager"
   //              }
   //            },
   //            {
   //              "type": "Literal",
   //              "value": "before:add:region",
   //              "raw": "'before:add:region'"
   //            },

   			// TODO: right now the template assumes the name of the event
   			// is the second object in the "arguments" array should add
   			// some checks.

            return ast.type === 'CallExpression' &&
            	ast.callee.type === 'MemberExpression' &&
            	ast.callee.property &&
            	ast.callee.property.name === 'listenTo';
		},



		// Custom Backbone.Marionette cases.

		// TODO: Indentation matters so pull indentation 
		// style from config and create tool for multiline
		// strings like PHP """.
		classes: function(ast) {
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



		extensions: function(ast) {

		}


	};