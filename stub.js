'use strict';

var jsDoccer = require('./src/jsdoccer.js'),
	configLoader = require('./src/util/config-loader.js'),
	args = Array.prototype.slice.call(process.argv, 2),
	filesStubbed = 0; // a count of the stubbed files

jsDoccer.init(configLoader('.jsdoccerrc'));

try {
	filesStubbed = jsDoccer.stub(args);
	console.log('Done: Generated ' + filesStubbed + ' YAML document stubs at'); 
	console.log('"jsdoccer/generated-files/yaml/stubbed/".');
	console.log('Remember to copy them into the yaml.src path defined in your .jsdoccerrc config.');
	console.log('directory before augmenting them with examples.');
} catch (err) {
	console.warn('Unable to generate YAML templates.');
	console.log('Usage: node stub "./path/to/target/file.js". Or set up your "js.src" default targets in the ".jsdoccerrc" config file to run it with out arguments.');
	console.log(err);
}
