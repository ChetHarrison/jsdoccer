'use strict';
	
var path = require('path'),
	fs = require('fs'),
	root = '../../../../',
	match = root + 'src/syntax-targets/',
	jsonPreToYamlStubbed = require(root + 'src/parsers/json-pre-to-yaml-stubbed.js'),
	expectedYaml = fs.readFileSync(path.resolve(__dirname, '../../../mock-files/yaml-stubbed/application.yaml'), {encoding: 'utf8'}),
	yamlTemplaters = {},
	jsonFile = fs.readFileSync(path.resolve(__dirname, '../../../mock-files/json-pre/application.json'), {encoding: 'utf8'});

yamlTemplaters['class'] = require(match + 'class/templateYaml.js'),
yamlTemplaters['constructor']  = require(match + 'constructor/templateYaml.js'),
yamlTemplaters['events']  = require(match + 'events/templateYaml.js'),
yamlTemplaters['functions']  = require(match + 'functions/templateYaml.js'),
yamlTemplaters['properties']  = require(match + 'properties/templateYaml.js');

describe('json-pre-to-yaml-stubbed', function () {
	
	it('should return expected stubbed YAML', function () {
		var generatedYaml;
		jsonPreToYamlStubbed.init({yamlTemplaters: yamlTemplaters})
		generatedYaml = jsonPreToYamlStubbed.parse(jsonFile);
		expect(generatedYaml).toEqual(expectedYaml);
	});
});
