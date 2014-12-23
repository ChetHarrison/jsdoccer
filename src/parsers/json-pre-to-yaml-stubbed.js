'use strict';

// Dependencies
var _ 				= require('lodash'),
	indentString 	= require('indent-string');

module.exports = {
	
	init: function(options) {
		options = options || {};
		this.yamlTemplaters = options.yamlTemplaters || {};
		// console.log(this.yamlTemplaters['file-name']({name: 'chet'}));
	},
		
	parse: function (json) {
		var yaml = '',
			syntaxTypes;
		
		json = JSON.parse(json);
		syntaxTypes = _.keys(json);
		
		_.each(syntaxTypes, function (type) {
			var templater = this.yamlTemplaters[type],
				syntaxJsons = json[type];

				// add type category
			
			if (Array.isArray(syntaxJsons)) {
				yaml += type + ':\n';
				_.each(syntaxJsons, function (syntaxJson) {
					yaml += indentString(templater(syntaxJson), ' ', 2);
					yaml += '\n';
				});
			} else {
				yaml += type + ': ' + templater(syntaxJsons);
				yaml += '\n';
			}

		}, this);

		return yaml;
	}
};