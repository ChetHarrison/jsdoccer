'use strict';

var jsDoccer = require('./src/jsdoccer.js'),
	fs = require('fs'),
	config = JSON.parse(fs.readFileSync('.jsdoccerrc')),
	args = process.argv;

args.shift(); // trim 'node'
args.shift(); // trim 'file path'
jsDoccer.init({
	config: config
});

// Any args?
if (args.length === 0) { args = config.jsToDocument.src; }

try {
	var filesStubbed = jsDoccer.generateStubbedDocYamlFiles(args);
	console.log('Done: Generated ' + filesStubbed + ' YAML document stubs at'); 
	console.log('"jsdoccer/generated-files/yaml/stubbed/".');
	console.log('Remember to copy them into the "jsdoccer/generated-files/yaml/stubbed/"');
	console.log('directory befor augmenting them with examples.');
} catch (err) {
	console.warn('Unable to generate YAML templates.');
	console.log('Useage: node jsdoccer-stub "./path/to/target/file.js". Or set up your "jsToDocument.src" default targets in the ".jsdoccerrc" config file to run it with out arguments.');
}

