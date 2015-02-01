#!/usr/bin/env node

'use strict';

var jsDoccer = require('../src/jsdoccer.js'),
  configLoader = require('../src/util/config-loader.js'),
  nodeStackTracer = require('../src/util/node-stack-tracer.js'),

  args = Array.prototype.slice.call(process.argv, 2),
  filesDocumented = 0; // a count of the documented files

jsDoccer.init(configLoader('.jsdoccerrc'));

try {
  // if no args were passed in pull from the config file
  args = !!args.length ? args : jsDoccer.config.documentedYaml.src;
  filesDocumented = jsDoccer.doc(args);
  console.log('Done: Generated ' + filesDocumented + ' file documents at');
  console.log(jsDoccer.config.dest + 'docs'); // to do pull this from config
} catch (err) {
  console.warn('Unable to generate documentation. Did you remember to copy your YAML from the "' + jsDoccer.config.dest + 'generated/yaml/stubbed/" folder to the ".jsdoccerrc.documentedYaml.src" folder?');
  console.warn('Useage: node doc "./path/to/target/file.yaml". Or set up your "documentedYaml.src" default targets in the ".jsdoccerrc" config file to run it with out arguments.');
  nodeStackTracer(err);
}
