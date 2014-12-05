'use strict';

// Dependencies
var _ 				= require('lodash'),
	fs 				= require('fs'),
	path 			= require('path'),
	_s 				= require('underscore.string'),
	indentString 	= require('indent-string');

module.exports = {
	
	init: function(options) {
		options = options || {};
		this.templates = options.templates;
	},
	
	getTemplateName: function (type) {
		var templatePath = _s.dasherize(type);
		
		templatePath = templatePath[0] === '-' ? templatePath.substr(1) : templatePath;
		templatePath = this.templates + '/' + templatePath + '.tpl';

		return templatePath;
	},
	
	getTemplate: function (type) {
		var filename = this.getTemplateName(type);
		return fs.readFileSync(path.resolve(filename), 'utf8');
	},
	
	convert: function (json) {
		var yaml = '',
			syntaxTypes = _.keys(json),
			self = this;

		_.each(syntaxTypes, function (type) {
			var template = self.getTemplate(type),
				syntaxJsons = json[type];

			if (json[type][0].isCollection) {
				// add type category
				yaml += type + ':\n';
				_.each(syntaxJsons, function (syntaxJson) {
					yaml += indentString(_.template(template, syntaxJson), ' ', 2);
					yaml += '\n';
				});
			} else {
				// hack to rename filename to name because ast collision
				// TODO: find better solution
				yaml += (type === 'filename' ? 'name' : type) + ': ';
				_.each(syntaxJsons, function (syntaxJson) {
					yaml += _.template(template, syntaxJson);
					yaml += '\n';
				});
			}

		});

		return yaml;
	}
};