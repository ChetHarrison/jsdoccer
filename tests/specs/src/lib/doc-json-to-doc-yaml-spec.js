'use strict';

var DocJsonToDocYaml 	= require('../../../../src/lib/doc-json-to-doc-yaml.js'),
	fs 					= require('fs'),
	getConfig 			= require('../../../../src/lib/get-config.js'),
	testConfigFile 		= __dirname + '/../../../.jsdoccerrc-test',
	config 				= getConfig(testConfigFile),
	desiredYaml 		= 'description: |',
	containsDesiredYaml, 
	generatedYaml;

describe('DocJsonToDocYaml', function () {

	beforeEach(function () {
		var jsonFile 			= __dirname + '/../../../mock-files/json/test.json',
			json 				= JSON.parse(fs.readFileSync(jsonFile, 'utf8')),
			docJsonToDocYaml 	= new DocJsonToDocYaml({config: config});

		generatedYaml = docJsonToDocYaml.convert(json);
		containsDesiredYaml = generatedYaml.indexOf(desiredYaml) > 0 ? true : false;
	});

	it('should return desired JSON', function () {
		expect(containsDesiredYaml).toBe(true);
	});
});
