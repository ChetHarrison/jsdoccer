'use strict';

var JsDoccer = require('../../src/jsdoccer.js'),
	
	// assignedIifeTest = require('/../mock-files/ast/assigned-iife-test.ast'),
	
	fs = require('fs'),

	configFile = __dirname + '/../.jsdoccerrc-test',
	
	testConfig = JSON.parse(fs.readFileSync(configFile, 'utf8')),
	
	syntaxMatchers = require('../../syntax-matchers.js'),
	
	ast;


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
