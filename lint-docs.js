var fs = require('fs'),

	configFile = __dirname + '/.jsdoccerrc',

	config = JSON.parse(fs.readFileSync(configFile, 'utf8')),
	
	JsDoccer = require('./src/jsdoccer.js'),
	
	jsDoccer;
	
	
jsDoccer = new JsDoccer({config: config});

jsDoccer.lintDocumentJson();
	
