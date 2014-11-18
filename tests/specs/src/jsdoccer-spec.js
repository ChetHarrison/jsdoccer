'use strict';

var fs 				= require('fs'),
	path 			= require('path'),
	jsdoccer 		= require(path.resolve(__dirname + '../../../../src/jsdoccer.js')),
	
	configFilePath 	= path.resolve(__dirname + '/../../.jsdoccerrc-test'),
	testConfig 		= JSON.parse(fs.readFileSync(configFilePath, 'utf8')),
	// vars
	ast;

describe('jsdoccer', function () {
	var yaml,
		testFiles = [],
		testFile = path.resolve('tests/mock-files/js/test.js');
	testFiles.push(testFile);
	
	beforeEach(function() {
		jsdoccer.init({
			config: testConfig
		});
		
		// spyOn(jsdoccer, 'generateStubbedDocYamlFile');
	    yaml = jsdoccer.generateStubbedDocYamlFiles(testFiles);
	});
	
	
	it('should call generateStubbedDocYamlFile()', function () {
		expect(jsdoccer.generateStubbedDocYamlFile).toHaveBeenCalled();
	});
});
