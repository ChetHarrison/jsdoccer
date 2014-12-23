'use strict';

var dox 		= require('dox'),
	_ 			= require('lodash'),
	jsYaml 		= require('js-yaml'),
	marked 		= require('marked'),
	highlight 	= require('highlight.js');


module.exports = {

	init: function (options) {
		options = options || {};
		this.targets = options.targets;
		this.markdown = new marked.Renderer();
		this.dox = dox.setMarkedOptions({
			renderer: this.markdown,
			gfm: 			true,
			tables: 		true,
			breaks: 		false,
			pedantic: 		false,
			sanitize: 		false,
			smartLists: 	true,
			smartypants: 	false,
			highlight: function (code, lang) {
				return highlight.highlight(lang, code).value;
			}
		});
	},
	
	
	parse: function (yaml) {
		var json = {};
		try {
			json = jsYaml.safeLoad(yaml); // yaml to json
		} catch (err) {
			console.warn(err.name + ':\n' + err.reason + '\n\n' + err.mark);
		}
		
		_.each(this.targets, function(target) {
			this.parseTarget(json[target]);
		}, this);
		
		return JSON.stringify(json, null, 2);
	},
	
	
	parseTarget: function (targetSet) {
		targetSet = targetSet || [];

		_.each(targetSet, function (value, name) {
			targetSet[name] = this.parseBody(value, name);
		}, this);

		return targetSet;
	},
	

	parseBody: function (value, name) {
		var result = {};

		if (_.isEmpty(value)) {
			return result;
		}

		// Function values have both a description and examples
		// If the function value is a string, only the description was added
		if (_.isObject(value)) {
			result = value;
		} else {
			result.examples = [];
			result.description = value;
		}

		if (result.description === undefined) {
			return result;
		}

		// TODO: FIX THIS
		// result.description = this.parseDox(result.description, name);

		_.each(result.examples, function (example) {
			result.examples[name] = marked(example.example);
		}, this);


		return result;
	},

	/**
	 * parse the dox comment string.
	 * We also pluck some tags from the tags property to make it easy to access later.
	 * This could probably be moved out into a separate presentation task that www consumes
	 *
	 **/
	parseDox: function (docString, name) {
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
		
		return marked(doc); // TODO: it is choking here
	}
};
