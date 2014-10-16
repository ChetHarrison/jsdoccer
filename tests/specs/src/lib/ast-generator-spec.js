'use strict';

var astGenerator = require('../../../../src/lib/ast-generator.js'),

	fs = require('fs'),

	desiredAST = {
		'type': 'Program',
		'body': [
			{
				'type': 'VariableDeclaration',
				'declarations': [
					{
						'type': 'VariableDeclarator',
						'id': {
							'type': 'Identifier',
							'name': 'answer'
						},
						'init': {
							'type': 'Literal',
							'value': 43,
							'raw': '43'
						}
		        }
		      ],
				'kind': 'var'
		    }
		  ]
	};


describe('AstGenerator', function () {

	var generatedAst;

	beforeEach(function () {

		var astFile = __dirname + '/../../../mock-files/js/test.js';

		generatedAst = astGenerator.createSyntaxTree(astFile);

	});


	it('should return desired AST', function () {

		expect(generatedAst).toEqual(desiredAST);
	});

});
