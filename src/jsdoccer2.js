'use strict';

// Dependencies
//-----------------------------------------
var fs = require('fs-extra'),
	path = require('path'),
	_ = require('lodash'),
	_fileGlobber = require('./util/file-globber.js'),
	// private 
	// decorations
	_jsToAst = require('./decorations/step1-js-to-ast.js'),
	_astToJsonPre = require('./decorations/step2-ast-to-json-pre.js'),
	_jsonPreToYamlStubbed = require('./decorations/step3-json-pre-to-yaml-stubbed.js'),
	_yamlDocumentedToJsonApi = require('./decorations/step4-yaml-documented-to-json-api.js'),
	_jsonApiToDocs = require('./decorations/step5-json-api-to-docs.js');



// API
//-----------------------------------------
module.exports = {

	// set object state
	// Need to be able to configure: 
	//   * output dir path
	init: function init(options) {
		options = options || {};
		_astToJsonPre.init({ syntaxMatchers: options.syntaxMatchers });
		_jsonPreToYamlStubbed.init({
			templates: options.yamlTemplates,
			dest: options.stubbed
		});
		_yamlDocumentedToJsonApi.init({ dest: options.api });
		_jsonApiToDocs.init({ htmlTemplate: options.htmlTemplates });
	},
	
	getDoc: function() {
		this.decorTargets.forEach(function(decor) {
			this.src = this.decorations[decor](this.src);
		}, this);
		return this.src;
	},
	
	decorations: {
		jsToAst: _jsToAst.createSyntaxTree,
		astToJsonPre: _astToJsonPre.parse,
		jsonPreToYamlStubbed: _jsonPreToYamlStubbed.convert,
		yamlDocumentedToJsonApi: _yamlDocumentedToJsonApi.compileJsDoc,
		jsonApiToDocs: _jsonApiToDocs.generate
	},
	
	
	decorateFiles: function (files) {
		_.each(files, function (file) {
			this.src = fs.readfileSync(file);
			console.log(this.getSrc);
		}, this);
		return files.length;
	},


	stub: function (fileGlobs) {
		var files;
		this.decorTargets = [
			'jsToAst',
			'astToJsonPre',
			'jsonPreToYamlStubbed'
		];
		// if no globs passed use config glob
		files = _fileGlobber(fileGlobs, this.config.js.src);
		this.decorateFiles(files);
	},


	doc: function (fileGlobs) {
		var files;
		this.decorTargets = [
			'yamlDocumentedToJsonApi',
			'jsonApiToDocs'
		];
		// if no globs passed use config glob
		files = _fileGlobber(fileGlobs, this.config.js.src);
		this.decorateFiles(files);
	},


	lint: function () {
		console.log('TODO: Impliment this.');
	}
};
