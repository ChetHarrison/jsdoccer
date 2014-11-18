'use strict';

var astToDocJson 	= require('../../../../src/lib/ast-to-doc-json.js'),
	path 			= require('path'),
	fs 				= require('fs'),
	desiredJSON 	= {
		'modules': [
			{
				'name': 'Undefined'
	        }
	    ]
	};

describe('astToDocJson', function () {
	var generatedAst;

	beforeEach(function () {
		var astFile 		= __dirname + '/../../../mock-files/js/test.ast';
		astToDocJson.init({
			syntaxMatchers: require(path.resolve('tests/jsdoccer/syntax-matchers.js'))
		});

		generatedAst = astToDocJson.parse(astFile);
	});

	// it('should return desired JSON', function () {
	// 	expect(generatedAst).toEqual(desiredJSON);
	// });
});
