'use strict';

var getConfig = require('./src/lib/get-config.js'),
	configPath = __dirname + '/.jsdoccerrc',
	config = getConfig(configPath),
	jsDoccer = require('./src/jsdoccer.js'),
	syntaxMatchers = require(config.syntaxMatchers.src);
	
jsDoccer.init({config: config.options});
jsDoccer.generateStubbedDocYamlFiles();
	
