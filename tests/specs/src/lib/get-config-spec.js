'use strict';

var getConfig 		= require('../../../../src/lib/get-config.js'),
	testConfigFile 	= __dirname + '/../../../.jsdoccerrc-test',
	desiredConfig 	= { 
		js: { src: './tests/mock-files/js/' },
  		ast: { dest: './tests/mock-files/ast/' },
  		json: { dest: './tests/mock-files/json/' },
  		yaml: { templates: './templates/', dest: './tests/mock-files/yaml/' },
  		jsdoc: { dest: './tests/mock-files/jsdoc/' },
  		syntaxMatchers: { src: './syntax-matchers.js' },
  		filesToFilter: [ '.DS_Store' ] 
  	};

describe('GetConfig', function () {
	
	// it('should return desired config', function () {
	// 	expect(getConfig(testConfigFile)).toEqual(desiredConfig);
	// });
});
