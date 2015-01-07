'use strict';

var dox = require('dox'),
	_ = require('lodash'),
	jsYaml = require('js-yaml'),
	marked = require('marked'),
	highlight = require('highlight.js'),
	markdown = new marked.Renderer(),
	fs = require('fs'),
	jsonWalker = require('../util/json-walker.js'),
	marker = marked, 
	
	// TODO: move decoration functions into config
	parseDox = function (docString, name) {
		var doc, tags;

		try {
			doc = dox.parseComment(docString);
		} catch (err) {
			console.warn('jsDocFile failed to parse string ' + docString + ' dox at ' + name);
		}

		tags = doc.tags || [];
		doc.api = _.findWhere(tags, {
			type: 'api'
		});
		doc.params = _.where(tags, {
			type: 'param'
		});
		doc.paramStr = _.pluck(doc.params, 'name').join(', ');

		doc.params = _.map(doc.params, function (param) {
			return _.extend(param, {
				typeStr: param.types.join(', '),
				description: param.description.replace(/^- /, '') // because dox doesn't parse the - out
			});
		});


		return doc;
	},
	decorationTargets = {
		'example': marked,
		'description': parseDox
	};

dox.setMarkedOptions({
	renderer: markdown,
	gfm: true,
	tables: true,
	breaks: false,
	pedantic: false,
	sanitize: false,
	smartLists: true,
	smartypants: false,
	highlight: function (code, lang) {
		return highlight.highlight(lang, code).value;
	}
});

module.exports = {

	parse: function(yaml) {
		var json = jsYaml.safeLoad(yaml);
		
		_.each(decorationTargets, function(fn, name) {
			jsonWalker(json, name, fn);
		});
		
		return JSON.stringify(json, null, 2);
	}
};