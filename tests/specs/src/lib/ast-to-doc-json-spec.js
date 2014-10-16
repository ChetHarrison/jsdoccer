'use strict';

var AstToDocJson = require('../../../../src/lib/ast-to-doc-json.js'),

	fs = require('fs'),

	desiredJSON = {
		'modules': [
			{
				'name': 'Undefined'
	        }
	    ]
	};


describe('AstToDocJson', function () {

	var generatedAst;

	beforeEach(function () {

		var astFile = __dirname + '/../../../mock-files/js/test.ast',

			astToDocJson = new AstToDocJson();



		generatedAst = astToDocJson.parse(astFile);

	});


	it('should return desired JSON', function () {

		expect(generatedAst).toEqual(desiredJSON);
	});

});
