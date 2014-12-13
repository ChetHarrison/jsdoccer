// http://massalabs.com/dev/2013/10/17/handling-errors-in-nodejs.html
'use strict';

var prettyjson = require('prettyjson'),
	formatJson = function (object) {
		// adds 4 spaces in front of each line
		var json = prettyjson.render(object);
		// json = json.split('\n').join('\n    ');
		return '    ' + json;
	};

module.exports = function(error) {
	var metadata = formatJson(error),
		stack = error.stack.trim(),
		message = stack + '\n  Metadata:\n' + metadata;
	console.error(message);
};
