'use strict';
/*jshint -W030 */

require('rx-array');

module.exports = function(ast) {
	return ast['class'];
};