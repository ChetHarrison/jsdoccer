'use strict';

var DocJsonToDocYaml = require('../../../../src/lib/doc-json-to-doc-yaml.js'),

	fs = require('fs'),

	desiredYAML = 'modules:\n' +
  				  '	  name: Undefined\n' +
  				  '   \n' +
  				  'description: | \n';


describe('DocJsonToDocYaml', function () {

	var generatedYaml;

	beforeEach(function () {

		var jsonFile = __dirname + '/../../../mock-files/json/test.json',
		
			json = JSON.parse(fs.readFileSync(jsonFile, 'utf8')),

			docJsonToDocYaml = new DocJsonToDocYaml();

		console.log('------------');
		console.log(jsonFile);

		generatedYaml = docJsonToDocYaml.convert(json);
		console.log(generatedYaml);
	});


	it('should return desired JSON', function () {

		expect(generatedYaml).toEqual(desiredYAML);
	});

});
