'use strict';

// Dependencies
var _ 				= require('lodash'),
	indentString 	= require('indent-string');

module.exports = {
	
	init: function(options) {
		options = options || {};
		this.yamlTemplaters = options.yamlTemplaters || {};
	},
		
	parse: function (json) {
		var yaml = '',
			syntaxTypes;
			
		json = JSON.parse(json);
		syntaxTypes = _.keys(json);
		
		_.each(syntaxTypes, function (type) {
			var templater = this.yamlTemplaters[type],
				syntaxJsons = json[type];

			if (json[type][0].isCollection) {
				// add type category
				yaml += type + ':\n';
				_.each(syntaxJsons, function (syntaxJson) {
					yaml += indentString(templater(syntaxJson));
					yaml += '\n';
				});
			} else {
				// hack to rename filename to name because ast collision
				// TODO: find better solution
				yaml += (type === 'filename' ? 'name' : type) + ': ';
				_.each(syntaxJsons, function (syntaxJson) {
					yaml += templater(syntaxJson);
					yaml += '\n';
				});
			}

		}, this);

		return yaml;
	}
};