'use strict';

var dox 		= require('dox'),
	_ 			= require('lodash'),
	yaml 		= require('js-yaml'),
	marked 		= require('marked'),
	highlight 	= require('highlight.js'),
	fs 			= require('fs'),
	path 		= require('path');


module.exports = {

	init: function (options) {
		options = options || {};
		this.dest = options.dest;
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


	compileJsDoc: function (file) {
		var doc = fs.readFileSync(file, {encoding: 'utf8'}),
			json = this.parseYaml(doc);

		json.functions = this.buildFunctions(json.functions);
		json.properties = this.buildProperties(json.properties);
		json.examples = this.buildExamples(json.examples);

		json.description = this.parseDescription(json.description);
		json.constructor = json.constructor || '';
		json.constructor = this.parseBody(json.constructor, 'constructor');
		
		return json;
	},


	parseDescription: function (description) {
		description = description || '';
		return marked(description);
	},


	buildFunctions: function (functions) {
		functions = functions || [];

		_.each(functions, function (value, name) {
			functions[name] = this.parseBody(value, name);
		}, this);

		return functions;
	},


	buildProperties: function (properties) {
		properties = properties || [];

		_.each(properties, function (value, name) {
			properties[name] = this.parseBody(value, name);
		}, this);

		return properties;
	},

	buildExamples: function (examples) {
		examples = examples || [];

		_.each(examples, function (example, i) {
			examples[i] = this.parseExample(example);
		}, this);

		return examples;
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
			result.examples[name] = this.parseExample(example);
		}, this);


		return result;
	},


	parseExample: function (example) {
		if (!example.name) {
			console.warn('jsDocFile failed to find example name');
		}

		if (!example.example) {
			console.warn('jsDocFile failed to find example for ' + example.name);
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


	// read yaml file
	parseYaml: function (file) {
		try {
			return yaml.safeLoad(file);
		} catch (err) {
			console.warn(err.name + ':\n' + err.reason + '\n\n' + err.mark);
		}
	}

};
