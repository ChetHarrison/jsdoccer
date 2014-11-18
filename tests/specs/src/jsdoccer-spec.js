'use strict';

var JsDoccer 		= require('../../../src/jsdoccer.js'),
	fs 				= require('fs'),
	configFilePath 		= __dirname + '/../../.jsdoccerrc-test',
	testConfig 		= JSON.parse(fs.readFileSync(configFilePath, 'utf8')),
	syntaxMatchers 	= require('../../../setup/syntax-matchers.js'),
	// vars
	ast;
	
console.log(process.cwd());


describe('JsDoccer', function () {
	var jsDoccer, yaml;
	
	beforeEach(function() {
		jsDoccer = new JsDoccer({
			config: testConfig,
			syntaxMatchers: syntaxMatchers
		});
		
		spyOn(jsDoccer, 'generateStubbedDocYamlFile');
	    yaml = jsDoccer.generateStubbedDocYamlFiles();
	});
	
	
	it('should call generateStubbedDocYamlFile()', function () {
		expect(jsDoccer.generateStubbedDocYamlFile).toHaveBeenCalled();
	});
});
