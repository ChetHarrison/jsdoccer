'use strict';

var fs = require('fs'),

	configFile = __dirname + '/../.jsdoccerrc';


module.exports = JSON.parse(fs.readFileSync(configFile, 'utf8'));