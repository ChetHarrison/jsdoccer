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
if (args.length === 0) { args = config.documentedYaml.src; }

try {
	jsDoccer.prepareYaml();
	var filesDocumented = jsDoccer.generateDoc();
	console.log('Done: Generated ' + filesDocumented + ' file documents at'); 
	console.log('"jsdoccer/documentation/".');
} catch (err) {
	console.warn('Unable to generate documentation. Did you remember to copy your YAML from the `jsdoccer/generated-files/yaml/stubbed/` folder to the `jsdoccer/generated-files/yaml/stubbed/` folder?');
	console.log('Useage: node jsdoccer-doc "./path/to/target/file.yaml". Or set up your "documentedYaml.src" default targets in the ".jsdoccerrc" config file to run it with out arguments.');
}

