'use strict';

var jsDoccer = require('./src/jsdoccer.js'),
	configLoader = require('./config-loader.js'),
	args = Array.prototype.slice.call(process.argv, 2),
	filesDocumented = 0; // a count of the documented files

jsDoccer.init({ config: configLoader('.jsdoccerrc') });

try {
	filesDocumented = jsDoccer.documentGlobs(args);
	console.log('Done: Generated ' + filesDocumented + ' file documents at'); 
	console.log('"jsdoccer/documentation/".');
} catch (err) {
	console.warn('Unable to generate documentation. Did you remember to copy your YAML from the `jsdoccer/generated-files/yaml/stubbed/` folder to the ".jsdoccerrc.documentedYaml.src" folder?');
	console.warn('Useage: node doc "./path/to/target/file.yaml". Or set up your "documentedYaml.src" default targets in the ".jsdoccerrc" config file to run it with out arguments.');
}
