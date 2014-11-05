/*
 * jsDocFiles is a task for compiling jsdoc api files
 *
 */

'use strict';
var jsdoccer = require('../src/jsdoccer.js');

module.exports = function(grunt) {
  grunt.registerMultiTask('jsDoccer:json', 'Compile jsdoc files to json', function() {
  	jsdoccer.prepareYamls(this.filesSrc);
    grunt.log.ok(this.filesSrc.length + ' ' + grunt.util.pluralize(this.filesSrc.length, 'file/files') + ' documented.');
  });
};
