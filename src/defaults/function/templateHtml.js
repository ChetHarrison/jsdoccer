'use strict';

var path = require('path'),
  loader = require('../../util/html-template-loader.js');
  
module.exports = loader(path.join(__dirname, '/templates/html.hbs'));