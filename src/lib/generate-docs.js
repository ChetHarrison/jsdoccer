'use strict';
/**
 * 1. run grunt api
 * 2. read the json for each jsdoc
 * 3. compile master json and write it to the api folder
 * 4. build the html files
 */
 
var bluebird = require('bluebird'),
	_ = require('lodash'),
	path = require('path'),
	fs = bluebird.promisifyAll(require('fs')),
	Handlebars = require('handlebars'),
	taskName = 'jsDoccer:html';
	

module.exports = {
	
	init: function (options) {
		this.options = options || {};
		this.files = options.files;
		this.handlebarsTemplate = options.handlebarsTemplate;
	},

	buildJsonFile: function () {
		var files = fs.readdirSync(this.files.src),
			jsonFiles = _.map(files, function (filename) {
			filename = path.resolve(this.files.src + filename);
			console.log(filename);
			var content = fs.readFileSync(filename).toString();
			return JSON.parse(content);
		}, this);

		console.log(this.files.src);

		var apiJson = {};
		apiJson.classes = [];
		apiJson.functions = {};
		apiJson.properties = {};

		_.each(jsonFiles, function (jsonFile) {
			if (_.has(jsonFile, 'class')) {
				apiJson.classes.push(jsonFile);
			} else {
				if (_.has(jsonFile, 'functions')) {
					_.extend(apiJson.functions, jsonFile.functions);
				}
				if (_.has(jsonFile, 'properties')) {
					_.extend(apiJson.properties, jsonFile.properties);
				}
			}
		});

		if (!fs.existsSync(path.resolve(this.files.dest))) {
			fs.mkdirSync(path.resolve(this.files.dest));
		}

		var apiFilePath = path.resolve(this.files.dest, 'api.json');
		fs.writeFileSync(apiFilePath, JSON.stringify(apiJson, null, '  '));
	},
	
	buildHtmlFiles: function () {
		var json = JSON.parse(fs.readFileSync(path.resolve(this.files.dest, 'api.json')));
		var classTpl = Handlebars.compile(fs.readFileSync(this.handlebarsTemplate).toString());

		_.each(json.classes, function (klass) {
			var data = {
				marionette: json,
				klass: klass
			};

			var classHtml = classTpl(data);
			var classPath = path.resolve(this.files.dest, klass.name + '.html');

			console.log('writing ' + klass.name + ' api file.');
			console.log(classPath);

			fs.writeFileSync(classPath, classHtml);

		}, this);
	},
	
	generate: function () {
		this.buildJsonFile();
		this.buildHtmlFiles();
	}
};
