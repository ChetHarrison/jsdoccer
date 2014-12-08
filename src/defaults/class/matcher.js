'use strict';
/*jshint -W030 */

require('./vendor/rx-array.js');

module.exports = function(ast) {
	return ast['class'];
};