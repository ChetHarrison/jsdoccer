#!/usr/bin/env node

'use strict';

var path = require('path'),
  jsDoccer = require('../src/jsdoccer.js'),
  configLoader = require('../src/util/config-loader.js'),
  nodeStackTracer = require('../src/util/node-stack-tracer.js'),

  args = Array.prototype.slice.call(process.argv, 2),
  destPath, srcPath,
  filesStubbed = 0; // a count of the stubbed files

jsDoccer.init(configLoader('.jsdoccerrc'));

try {
  // if no args were passed in pull from the config file
  args = !!args.length ? args : jsDoccer.config.js.src;
  destPath = path.resolve(jsDoccer.config.dest + 'yaml-stubbed');
  srcPath = path.resolve(jsDoccer.config.dest + 'yaml-documented');
  filesStubbed = jsDoccer.stub(args);
  console.log('Done: Generated ' + filesStubbed + ' YAML document stubs at');
  console.log(destPath);
  console.log('Remember to copy them into ' + srcPath + ' path defined in your .jsdoccerrc config.');
  console.log('directory BEFORE augmenting them with examples.');
} catch (err) {
  console.warn('Unable to generate YAML templates.');
  console.log('Usage: node stub "./path/to/target/file.js". Or set up your "js.src" default targets in the ".jsdoccerrc" config file to run it with out arguments.');
  nodeStackTracer(err);
}
