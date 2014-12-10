'use strict';

var fs = require('fs'),
	path = require('path'),
	
	ast = fs.readFileSync(path.resolve('./jsdoccer/generated/json/ast/jsdoccer.ast'), { encoding: 'utf8' }),
	astToJasonPre = require('./src/transforms/step2-ast-to-json-pre.js'),
	jsonPreToYamlStubbed = require('./src/transforms/step3-json-pre-to-yaml-stubbed.js'),
	yamlDocumentedToJsonApi = require('./src/transforms/step4-yaml-documented-to-json-api.js'),
	jsonApiToDocs = require('./src/transforms/step5-json-api-to-docs.js');
		
	
ast = JSON.parse(ast);

astToJasonPre.init({ syntaxMatchers: {
		'class': 		require('./src/defaults/class/matcher.js'),
		'constructor': 	require('./src/defaults/constructor/matcher.js'),
		'properties': 	require('./src/defaults/property/matcher.js'),
		'functions': 	require('./src/defaults/function/matcher.js'),
		'events': 		require('./src/defaults/event/matcher.js'),
	} 
});


var jsonPre = astToJasonPre.parse(ast);

// console.log(JSON.stringify(jsonPre, null, 2));

jsonPreToYamlStubbed.init({
	dest: path.resolve('./test-dir'),
	templaters: {
		'class': 		require('./src/defaults/class/templateYaml.js'),
		'constructor': 	require('./src/defaults/constructor/templateYaml.js'),
		'properties': 	require('./src/defaults/property/templateYaml.js'),
		'functions': 	require('./src/defaults/function/templateYaml.js'),
		'events': 		require('./src/defaults/event/templateYaml.js'),
	} 
});

var yaml = jsonPreToYamlStubbed.converter(jsonPre);

// console.log(yaml);

yamlDocumentedToJsonApi.init();
var jsonApi = yamlDocumentedToJsonApi.convert(yaml);

console.log(JSON.stringify(jsonApi, null, 2));

jsonApiToDocs.init({
	htmlTemplate: path.resolve('./src/defaults/docs-index.hbs'),
	navJson: ['ClassOne', 'ClassTwo']
});

var classTemplater = require('./src/defaults/class/templateHtml.js');
var doc = jsonApiToDocs.generate(jsonApi, classTemplater);

console.log(doc);

