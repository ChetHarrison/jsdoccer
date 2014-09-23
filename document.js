'use strict';

// my comment
if (process.argv.length < 3) {
  console.log('Usage: node ' + process.argv[1] + ' FILENAME');
  process.exit(1);
}

var fs = require('fs')
  , filename = process.argv[2]
  , esprima = require('esprima');

fs.readFile(filename, 'utf8', function(err, code) {
  if (err) throw err;
  console.log('Parsing: ' + filename);
  console.log(JSON.stringify(esprima.parse(code), null, 4));
});