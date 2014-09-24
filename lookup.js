'use strict';

var Lookup = function(options) {
  // maps esprima to jsdoc
  var defaultConfig = {

  };

  this.syntaxTree = options.syntaxTree;
  this.config = options.config || defaultConfig;
}

Lookup.prototype.bodyLength = function() {
  return this.syntaxTree.body.length;
}

Lookup.prototype.toYaml = function(esprimaTag) {

}

module.exports = Lookup;
