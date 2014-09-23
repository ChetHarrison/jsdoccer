'use strict';

var fs = require('fs'),
  path = require('path'),
  filename = process.argv[2],
  esprima = require('esprima'),
  inputPath = 'input/js/',
  input = fs.readdirSync(inputPath),
  outputPath = 'output/',
  output,
  documentFile = function(filename) {
    var fullInputPath = path.join(inputPath + filename),
      fullOutputPath = path.join(outputPath + path.basename(filename, '.js') + '.json'),
      code, doc;

    code = fs.readFileSync(fullInputPath, 'utf8');

    console.log('Parsing: ' + filename);
    doc = JSON.stringify(esprima.parse(code), null, 2);

    fs.writeFileSync(fullOutputPath, doc);
    console.log(filename + ' has been documented at: ' + fullOutputPath);
  };

// check for command line for target js file arguments.
if (process.argv.length >= 4) {
  console.log('TODO: take more than one arg. right now it only takes one at the command line.');
  process.exit(1);
}
else if (process.argv.length >= 3) {
  documentFile(filename);
}
// check the input folder for target js files.
else if (input.length > 0) {
  input.forEach(documentFile);
}
// bad usage
else {
  console.log('Usage: node ' + process.argv[1] + ' FILENAME');
  console.log('Or for batch processing save your js files in ' + inputPath);
  process.exit(1);
}