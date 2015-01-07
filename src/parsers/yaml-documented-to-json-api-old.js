'use strict';

var dox = require('dox'),
	_ = require('lodash'),
	jsYaml = require('js-yaml'),
	marked = require('marked'),
	highlight = require('highlight.js');


module.exports = {

	init: function (options) {
		options = options || {};
		this.targets = options.targets;
		this.markdown = new marked.Renderer();
		this.dox = dox.setMarkedOptions({
			renderer: this.markdown,
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
	},
	
	
	yamlToJson: function(yaml) {
		try {
			return jsYaml.safeLoad(yaml); // yaml to json
		} catch (err) {
			console.warn(err.name + ':\n' + err.reason + '\n\n' + err.mark);
		}
	},


	parse: function (yaml) {
		var json = this.yamlToJson(yaml);
		
		console.log(json.constructors.examples);
	
		_.each(this.targets, function (target) {
			json[target] = this.parseTarget(json[target]); // run objects through marked
		}, this);
		
		// Markdown file description and examples
		// TODO: Markdown options should be moved to config.
		if (json.description) { json.description = marked(json.description); }
		if (json.examples) { 
			json.examples.forEach(function(example) {
				this.parseExample(example);
			}, this);
		}

		return JSON.stringify(json, null, 2);
	},


	parseTarget: function (targetSet) {
		var keys;
		if (_.isObject(targetSet)) { 
			keys = Object.keys(targetSet);
			keys.forEach(function(key) {  
				targetSet[key] = this.parseBody(targetSet[key]);
			}, this);
		}

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
	
		result.description = this.parseDox(result.description, name);

		_.each(result.examples, function (example) {
			var parsedExample = this.parseExample(example);
			if (!_.isNull(parsedExample)) {
				result.examples[name] = parsedExample;
			}
		}, this);
		
		return result;
	},
	
	
	parseExample: function(example) {
    if (!example.name) {
        console.warn('jsDocFile failed to find example name');
        return null;
    }

    if (!example.example) {
        console.warn('jsDocFile failed to find example for ' + example.name);
        return null;
    }

    example.example = marked(example.example);

    return example;
  },

	/**
	 * parse the dox comment string.
	 * We also pluck some tags from the tags property to make it easy to access later.
	 * This could probably be moved out into a separate presentation task that www consumes
	 *
	 **/
	parseDox: function (docString, name) {
		var tags, doc;
		try {
			doc = this.dox.parseComment(docString);
		} catch (err) {
			console.warn('jsDocFile failed to parse dox at ' + name);
		}

		tags = doc.tags || [];
		doc.api = _.findWhere(tags, { type: 'api' });
		doc.params = _.where(tags, { type: 'param' });
		doc.paramStr = _.pluck(doc.params, 'name').join(', ');

		doc.params = _.map(doc.params, function (param) {
			return _.extend(param, {
				typeStr: param.types.join(', '),
				description: param.description.replace(/^- /, '') // because dox doesn't parse the - out
			});
		});

		return doc;
	},
};
