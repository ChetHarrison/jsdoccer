var Promise      = require('bluebird');
var _            = require('lodash');
var path         = require('path');
var gitty        = require('gitty');
var fs           = Promise.promisifyAll(require('fs'));
var Handlebars   = require('handlebars');
var taskName     = 'jsDoccer:html'

module.exports = function(grunt) {

  // grunt.config.merge({
  //   jsDocFiles: {
  //    docs: {
  //       options: {
  //       },

  //       files: [{
  //         expand: true,
  //         cwd: 'backbone.marionette/api',
  //         src: '*.jsdoc',
  //         dest: 'backbone.marionette/jsdoc',
  //         ext: '.json'
  //       }]
  //     }
  //   }
  // });

  grunt.registerMultiTask(taskName, function() {
    var options             = this.options();
    var files               = this.files[0];
    var task                = new Task(grunt, options, files);
  });
}

/**
 * 1. run grunt api
 * 2. read the json for each jsdoc
 * 3. compile master json and write it to the api folder
 * 4. build the html files
 */

var Task = function(grunt, options, files, handlebarsTemplate) {
  this.options   = options;
  this.files = files;
  // this.runJsDocFiles(grunt);
  this.buildJsonFile();
  this.handlebarsTemplate = grunt.config.get(taskName).doc.options.handelbarsTemplate;
  this.buildHtmlFiles();
  grunt.log.ok(this.filesSrc.length + ' ' + grunt.util.pluralize(this.filesSrc.length, 'file/files') + ' documented.');
}

_.extend(Task.prototype, {
  // runJsDocFiles: function(grunt) {
  //   grunt.task.run('jsDocFiles');
  // },
  
  buildHtmlFiles: function() {
    var json = JSON.parse(fs.readFileSync(path.resolve(this.files.dest, 'api.json')));
    var classTpl = Handlebars.compile(fs.readFileSync(this.handlebarsTemplate).toString());
    
    _.each(json.classes, function(klass) {  
      var data = {
        marionette: json,
        klass: klass
      }

      var classHtml = classTpl(data);
      var classPath = path.resolve(this.files.dest, klass.name + '.html');
  
      console.log('writing ' + klass.name + ' api file.');
      console.log(classPath);
      
      fs.writeFileSync(classPath, classHtml);

      // fs.writeFile(classPath, classHtml, function(err) {
      //   if (err) {
      //     console.log('error', err);
      //   }
      //   console.log('success');
      // })
      
    }, this)    
  },

  // buildHtmlFiles: function(files) {
  //   var self = this;
  //   files.forEach(function (file) {
  //     self.buildHtmlFile(file);
  //   });
  // },

  buildJsonFile: function() {
    var jsonFiles = _.map(this.files.src, function(filename) {
      var content = fs.readFileSync(filename).toString();
      return JSON.parse(content);
    });

    var apiJson = {};
    apiJson.classes = [];
    apiJson.functions = {};
    apiJson.properties = {};

    _.each(jsonFiles, function(jsonFile) {
      if (_.has(jsonFile, 'class')) {
        apiJson.classes.push(jsonFile);
      } else {
        if (_.has(jsonFile, 'functions')) {
          _.extend(apiJson.functions, jsonFile.functions)
        }
        if (_.has(jsonFile, 'properties')) {
          _.extend(apiJson.properties, jsonFile.properties)
        }
      }
    });

    if (!fs.existsSync(path.resolve(this.files.dest))) {
      fs.mkdirSync(path.resolve(this.files.dest));
    }

    // console.log('json', apiJson);
    var apiFilePath = path.resolve(this.files.dest, 'api.json');
    fs.writeFileSync(apiFilePath, JSON.stringify(apiJson, null, '  '));
  }
});