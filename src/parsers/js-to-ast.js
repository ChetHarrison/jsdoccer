'use strict';

var esprima = require('esprima');

module.exports = {
  parse: function (javascript) {
    var json = esprima.parse(javascript, {
      loc: false,
      range: false,
      raw: false,
      tokens: false,
      comment: false,
    });
    
    return JSON.stringify(json, null, 2);
  }
};
