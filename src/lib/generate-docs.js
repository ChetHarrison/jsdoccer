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
	taskName = 'jsDoccer:html',
	numberOfDocument;
	

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
			var content = fs.readFileSync(filename).toString();
			return JSON.parse(content);
		}, this);


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
		var json = JSON.parse(fs.readFileSync(path.resolve(this.files.dest, 'api.json'))),
			classTpl = Handlebars.compile(fs.readFileSync(this.handlebarsTemplate).toString()),
			numberOfClasses = 0;

		_.each(json.classes, function (klass) {
			var data = {
				marionette: json,
				klass: klass
			};

			var classHtml = classTpl(data);
			var classPath = path.resolve(this.files.dest, klass.name + '.html');

			// console.log('writing ' + klass.name + ' api file.');

			fs.writeFileSync(classPath, classHtml);
			numberOfClasses++;
			
		}, this);
		
		return numberOfClasses;
	},
	
	generate: function () {
		this.buildJsonFile();
		return this.buildHtmlFiles();
	}
};
