#!/usr/bin/env node

'use strict';

var jsDoccer = require('../src/jsdoccer.js'),
  configLoader = require('../src/util/config-loader.js'),
  nodeStackTracer = require('../src/util/node-stack-tracer.js'),
  minimist = require('minimist'),
  glob = require('glob'),
  path = require('path'),
  args = Array.prototype.slice.call(process.argv, 2),
  filesDocumented = 0, // a count of the documented files
  src, output;

var parsedArgs = minimist(args);

jsDoccer.init(configLoader('.jsdoccerrc'));


if (parsedArgs.src) {
  src = path.join(process.cwd(), parsedArgs.src);
}

if (parsedArgs.output) {
  output = path.join(process.cwd(), parsedArgs.output);
}

filesDocumented = jsDoccer.doc(
  glob.sync(src || jsDoccer.config.documentedYaml.src), output
);

console.log('Done: Generated ' + filesDocumented + ' file documents at');

