var esprima = require('esprima');
console.log(JSON.stringify(esprima.parse('var answer = 42'), null, 4));