'use strict';

var config = require('./src/get-config.js'),

	JsDoccer = require('./src/jsdoccer.js'),
	
	syntaxMatchers = require(config.syntaxMatchers.src),
	
	jsDoccer = new JsDoccer({
		config: config,
	
		syntaxMatchers: syntaxMatchers
	});

jsDoccer.generateStubbedDocYamlFiles();
	
