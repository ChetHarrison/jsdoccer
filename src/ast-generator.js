'use strict';

// Dependencies
//-----------------------------------------
var _ = require('lodash'),

	fs = require('fs'),
	
	esprima = require('esprima'),

	AstGenerator;


// Constructor
//-----------------------------------------
AstGenerator = function(options) {
	options = options || {};
	
	this.config = options.config;
};


// Functions
//-----------------------------------------
_.extend(AstGenerator.prototype, {
	
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
	
});

// API
//-----------------------------------------
module.exports = AstGenerator;