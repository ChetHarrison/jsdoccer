'use strict';

var jsDoccer = require('./src/jsdoccer.js'),
	fs = require('fs'),
	config = JSON.parse(fs.readFileSync('.jsdoccerrc')),
	args = process.argv,
	glob = require('glob');

args.shift(); // trim 'node'
args.shift(); // trim 'file path'
jsDoccer.init({
	config: config
});

function buildFileArray(files) {
	var expandedFiles, 
		qualifiedFiles = [];
		
	files.forEach(function(file) {
		expandedFiles = glob.sync(file);
	});
	expandedFiles.forEach(function(expandedFile) {
		qualifiedFiles.push(expandedFile);
	});
	
	return qualifiedFiles;
}

// Any args?
if (args.length === 0) { 
	if (Array.isArray(config.jsToDocument.src)) {
		args = buildFileArray(config.jsToDocument.src);
	}
	else {
		args.push(config.jsToDocument.src);
		args = buildFileArray(args);
	}
}


try {
	var filesStubbed = jsDoccer.generateStubbedDocYamlFiles(args);
	console.log('Done: Generated ' + filesStubbed + ' YAML document stubs at'); 
	console.log('"jsdoccer/generated-files/yaml/stubbed/".');
	console.log('Remember to copy them into the "jsdoccer/generated-files/yaml/stubbed/"');
	console.log('directory before augmenting them with examples.');
} catch (err) {
	console.warn('Unable to generate YAML templates.');
	console.log('Usage: node jsdoccer-stub "./path/to/target/file.js". Or set up your "jsToDocument.src" default targets in the ".jsdoccerrc" config file to run it with out arguments.');
	console.log(err);
}

