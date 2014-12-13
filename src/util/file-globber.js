'use strict';

// https://github.com/isaacs/node-glob
var glob = require('glob');

// Returns and array of file paths.
module.exports = function buildFileArray(fileGlobs) {
	var files, 
		targets = [];
		
	fileGlobs.forEach(function(fileGlob) {
		files = glob.sync(fileGlob);
		
		files.forEach(function(expandedFile) {
			targets.push(expandedFile);
		});
	});
	
	return targets;
};