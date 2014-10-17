'use strict';

// Dependencies
//-----------------------------------------
var fs = require('fs'),
	esprima = require('esprima'),
	// vars
	AstGenerator;

// static class
//-----------------------------------------
AstGenerator = {
	createSyntaxTree: function (file) {
		var code = fs.readFileSync(file, 'utf8');

		return esprima.parse(code, {
			loc: false,
			range: false,
			raw: false,
			tokens: false,
			comment: false,
		});
	}
};

// API
//-----------------------------------------
module.exports = AstGenerator;