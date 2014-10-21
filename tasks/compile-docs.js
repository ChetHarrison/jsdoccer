// var Promise      = require('bluebird');
// var EventEmitter = require('events').EventEmitter;
// var _            = require('lodash');
// var fs           = Promise.promisifyAll(require('fs'));
// var path         = require('path');
// var gitty        = require('gitty');
// var mkdirp       = Promise.promisify(require('mkdirp'));
// var rimraf       = Promise.promisify(require('rimraf'));
// var marked       = require('marked');
// var highlight    = require('highlight.js');

// var renderer = new marked.Renderer();

// renderer.heading = function(text, level, raw) {
//   var escapedText = raw
//     .toLowerCase()
//     .replace(/[']/g, '') // Add edge cases: /[1|2|3]/g
//     .replace(/[^\w]+/g, '-')
//     .replace(/-$/, '');;

//   return (
//     '<h'+level+'>'+
//       '<a name="'+escapedText+'" class="anchor" href="#'+escapedText+'">'+
//         '<span class="header-link"></span>'+
//       '</a>'+
//       text+
//     '</h'+level+'>'
//   );
// };

// marked.setOptions({
//   renderer: renderer,
//   gfm: true,
//   tables: true,
//   breaks: false,
//   pedantic: false,
//   sanitize: true,
//   smartLists: true,
//   smartypants: false,
//   highlight: function (code, lang) {
//     return highlight.highlightAuto(code, [lang]).value;
//   }
// });

// var Compiler = function(paths) {
//   this.paths = paths;
//   this.repo = Promise.promisifyAll(gitty(this.paths.repo));
// };

// Compiler.prototype = new EventEmitter();

// _.extend(Compiler.prototype, {
//   compile: function() {
//     return Promise.bind(this)
//       .then(this.setup)
//       .then(this.readFiles)
//       .then(this.writeFiles)
//       .then(this.cleanup);
//   },

//   setup: function() {
//     return Promise.all([
//       fs.readFileAsync(this.paths.template).call('toString'),
//       mkdirp(this.paths.tmp),
//       this.repo.tagsAsync()
//     ]).bind(this).spread(function(template, dir, tags) {
//       this.template = _.template(template);
//       this.tmpDir   = dir;
//       this.tags     = tags;
//     });
//   },

//   readFiles: function() {
//     return Promise.bind(this).return(this.tags).map(function(tag) {
//       return this.repo.checkoutAsync(tag).bind(this).then(function() {
//         return fs.readdirAsync(this.paths.src);
//       }).filter(function(filename) {
//         return path.extname(filename) === '.md';
//       }).map(function(filename) {
//         var src = path.resolve(this.paths.src, filename);
//         return fs.readFileAsync(src).bind(this).then(function(contents) {
//           this.emit('readFile', { file: src });
//           return {
//             tag      : tag,
//             basename : path.basename(filename, '.md'),
//             filenane : filename,
//             pathname : path.resolve(this.paths.tmp, tag),
//             contents : marked(contents.toString())
//           };
//         });
//       }).catch(function(err) {
//         return false;
//       });
//     }, { concurrency: 1 }).filter(function(files) {
//       return files;
//     }).then(function(files) {
//       this.files = files;
//     });
//   },

//   writeFiles: function() {
//     return Promise.bind(this).return(this.files).map(function(tag) {
//       return Promise.bind(this).return(tag).map(function(file) {
//         file.contents = this.template({
//           content : file.contents,
//           tags    : this.tags,
//           file    : file,
//           files   : tag
//         });

//         return mkdirp(file.pathname).bind(this).then(function() {
//           this.emit('mkdirp', { dir: file.pathname });
//         }).return(file);
//       }).map(function(file) {
//         var dest = path.resolve(file.pathname, file.basename + '.html');
//         return fs.writeFileAsync(dest, file.contents).bind(this).then(function() {
//           this.emit('writeFile', { file: dest });
//         });
//       });
//     });
//   },

//   cleanup: function() {
//     var tmpDir = path.resolve(this.paths.tmp, '..');
//     return Promise.bind(this).then(function() {
//       return rimraf(this.paths.dest);
//     }).then(function() {
//       this.emit('rimraf', { dir: this.paths.dest });
//       return mkdirp(path.resolve(this.paths.dest, '..'));
//     }).then(function() {
//       this.emit('mkdirp', { dir: this.paths.dest });
//       return fs.symlinkAsync(this.paths.tmp, this.paths.dest);
//     }).then(function() {
//       this.emit('symlink', { from: this.paths.tmp, to: this.paths.dest });
//       return fs.readdirAsync(tmpDir);
//     }).filter(function(dir) {
//       dir = path.resolve(tmpDir, dir);
//       return fs.statAsync(dir).bind(this).then(function(stats) {
//         return stats.isDirectory() && dir !== this.paths.tmp;
//       });
//     }).map(function(dir) {
//       dir = path.resolve(tmpDir, dir);
//       return rimraf(dir).bind(this).then(function() {
//         this.emit('rimraf', { dir: dir });
//       });
//     });
//   },

//   _readFile: function(file) {
//     return fs.readFileAsync(path.resolve(file)).call('toString');
//   },

//   _readDir: function(dir) {
//     return fs.readdirAsync(path.resolve(dir));
//   },

//   _writeFile: function(file, contents) {
//     return fs.writeFileAsync(path.resolve(file), contents);
//   }
// });

// module.exports = function(grunt) {
//   grunt.registerMultiTask('compileDocs', function() {
//     var options = this.options();
//     var files = this.files[0];

//     var compiler = new Compiler({
//       repo     : path.resolve(options.repo),
//       template : path.resolve(options.template),
//       tmp      : path.resolve('./.grunt/compileDocs/' + Date.now()),
//       src      : path.resolve(files.orig.src[0]),
//       dest     : path.resolve(files.dest)
//     });

//     compiler.on('readFile', function(data) {
//       grunt.verbose.writeln('readFile: ' + data.file);
//     });

//     compiler.on('mkdirp', function(data) {
//       grunt.verbose.writeln('mkdirp: ' + data.dir);
//     });

//     compiler.on('writeFile', function(data) {
//       grunt.verbose.writeln('writeFile: ' + data.file);
//     });

//     compiler.on('symlink', function(data) {
//       grunt.verbose.writeln('symlink: from ' + data.from + ' to ' + data.to);
//     });

//     compiler.on('rimraf', function(data) {
//       grunt.verbose.writeln('writeFile: ' + data.file);
//     });

//     compiler.compile().then(function() {
//       compiler.removeAllListeners();
//       grunt.log.ok('Success!');
//     }).then(this.async());
//   });
// };
