'use strict';

var fs = require('fs'),
  path = require('path'),
  _ = require('lodash'),
  glob = require('glob'),
  // parsers
  jsToAst = require('./parsers/js-to-ast'),
  astToJsonPre = require('./parsers/ast-to-json-pre.js'),
  jsonPreToYamlStubbed = require('./parsers/json-pre-to-yaml-stubbed.js'),
  yamlDocumentedToJsonApi = require('./parsers/yaml-documented-to-json-api.js'),
  jsonApiToDocs = require('./parsers/json-api-to-docs.js');

module.exports = {

  _globToFileList: function(fileGlobs) {
    var files = [];
    fileGlobs.forEach(function(fileGlob) { files.push(glob.sync(fileGlob)); });
    files = files.mergeAll();
    return files;
  },


  _buildJsonNav: function (fileGlobs) {
    var files = this._globToFileList(fileGlobs),
      jsonNav = {files: []};
    _.each(files, function (file) {
      jsonNav.files.push({name: this._fileName(file)});
    }, this);

    return jsonNav;
  },


  _fileName: function(filePath) {
    return path.basename(filePath, path.extname(filePath));
  },


  _setupWorkingDir: function(dest) {
    // set up local working directory
    var intermediate = 'intermediate/';

    this.paths = {
      dest: path.resolve(dest),
      intermediate: path.resolve(path.resolve(dest, intermediate)),
      ast: path.resolve(dest, intermediate + 'ast'),
      jsonPre: path.resolve(dest, intermediate + 'json-pre'),
      yamlStubbed: path.resolve(dest + 'yaml-stubbed'),
      jsonApi: path.resolve(dest, intermediate + 'json-api'),
      docs: path.resolve(dest, 'docs')
    };

    _.each(this.paths, function(aPath) {
      if (!fs.existsSync(aPath)) {
        fs.mkdirSync(aPath);
      }
    });
  },


  _duplicateTargets: function(defaultTargets, customTargets) {
    var targetCount = defaultTargets.length + customTargets.length,
      uniqueCount = _.union(defaultTargets, customTargets).length;

    return targetCount !== uniqueCount;
  },


  _getFile: function(target, targetPath, file) {
    return require(path.resolve(path.join(__dirname, targetPath, '/', target, '/', file)));
  },


  _addSyntaxTargetByName: function(target, targetPath) {
    this.addSyntaxTargets({
      target:      target,
      linter:      this._getFile(target, targetPath, 'linter.js'),
      matcher:     this._getFile(target, targetPath, 'matcher.js'),
      yamlTemplater: this._getFile(target, targetPath, 'templateYaml.js'),
      htmlTemplater: this._getFile(target, targetPath, 'templateHtml.js')
    });
  },


  _addSyntaxTarget: function(options) {
    // TODO: check for name collisions
    var target = options.target;
    this.targets.push(target);
    this.linters[target]    = options.linter;
    this.matchers[target]     = options.matcher;
    this.yamlTemplaters[target] = options.yamlTemplater;
    this.htmlTemplaters[target] = options.yamlTemplater;
  },


  addSyntaxTargets: function(options) {
    if (_.isArray(options)) {
      _.each(options, function(option) {
        this._addSyntaxTarget(option);
      });
    }

    this._addSyntaxTarget(options);
  },


  init: function(options) {
    var dest, intermediate,
      defaultTargets,
      customTargets,
      targets;

    options = options || {};
    this.config = options;
    this.targets = [];
    this.linters = {};
    this.matchers = {};
    this.yamlTemplaters = {};
    this.htmlTemplaters = {};
    this.config.projectName = this.config.projectName ||
      path.basename(process.cwd());


    this._setupWorkingDir(this.config.dest);


    // configure targets
    defaultTargets = Object.keys(this.config.targets.default)
      .filter(function(target) {
        return this.config.targets.default[target]; // filter false values in config
      }, this);

    customTargets = Object.keys(this.config.targets.custom)
      .filter(function(target) {
        return this.config.targets.custom[target]; // filter false values in config
      }, this);

    if (this._duplicateTargets(defaultTargets, customTargets)) {
      throw 'Syntax target names must be unique.';
    }

    _.each(defaultTargets, function(target) {
      this._addSyntaxTargetByName(target, './syntax-targets/');
    }, this);

    _.each(customTargets, function(target) {
      this._addSyntaxTargetByName(target, this.config.targets.customTargetsPath);
    }, this);


    // init parsers
    astToJsonPre.init({ matchers: this.matchers });
    jsonPreToYamlStubbed.init({ yamlTemplaters: this.yamlTemplaters });
    jsonApiToDocs.init({
      htmlTemplaters: this.htmlTemplaters,
      docPageTplPath: path.resolve(__dirname, 'syntax-targets/docs-index.hbs'),
      projectName: this.config.projectName
    });
  },


  // convert a glob arg to array of file paths
  // read in each file and apply the parser function
  // save the results and return the number of parsed files
  _parseGlobs: function (fileGlobs, steps) {
    var files = this._globToFileList(fileGlobs);

    _.each(files, function (file) {
      var input = fs.readFileSync(file, 'utf8');
      _.each(steps, function (step) {

        var output = step.parser.parse(input),
          dest = path.join(
            step.dest,
            this._fileName(file) + '.' + step.ext
          );

        if (step.needsFileName) {
          output = JSON.parse(output);
          output['name'] = {
            name: this._fileName(file)
          };
          output = JSON.stringify(output, null, 2);
        }

        if (step.jsonNav) {
          output = JSON.parse(output);
          output.nav = step.jsonNav;
          output = JSON.stringify(output, null, 2);
        }
        fs.writeFileSync(dest, output);
        // this feeds the output of one parser into the
        // input of the next parser
        input = output;
      }, this);
    }, this);

    return files.length;
  },


  // Generate stubbed yaml file.
  stub: function(globs) {
    return this._parseGlobs(globs, [{
        parser: jsToAst,
        dest: this.paths.ast,
        ext: 'ast'
      }, {
        parser: astToJsonPre,
        dest: this.paths.jsonPre,
        ext: 'json',
        needsFileName: true
      }, {
        parser: jsonPreToYamlStubbed,
        dest: this.paths.yamlStubbed,
        ext: 'yaml'
      }]);
  },

  // Generate html documentation from documented yaml
  doc: function(files, dest) {
    var jsonNav = this._buildJsonNav(files);

    return this._parseGlobs(files, htmlTemplate, [{
        parser: yamlDocumentedToJsonApi,
        dest: this.paths.jsonApi,
        ext: 'json',
        jsonNav: jsonNav
      }, {
        parser: jsonApiToDocs,
        dest: dest || this.paths.docs,
        ext: 'html'
      }]);
},

  // Lint the documentation
  lint: function(globs) {
    console.log('TODO: Implement the linter.');
  }
};



