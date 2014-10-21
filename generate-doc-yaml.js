'use strict';

var getConfig = require('./src/lib/get-config.js'),
	configPath = __dirname + '/.jsdoccerrc',
	config = getConfig(configPath),
	JsDoccer = require('./src/jsdoccer.js'),
	syntaxMatchers = require(config.syntaxMatchers.src),
	
	jsDoccer = new JsDoccer({
		config: config,
		syntaxMatchers: syntaxMatchers
	});

jsDoccer.generateStubbedDocYamlFiles();
	
