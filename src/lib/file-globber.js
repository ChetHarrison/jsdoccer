'use strict';

// https://github.com/isaacs/node-glob
var globber = require('glob');

// Takes and array of globs and returns and array of file paths
// The optional defautGlobs argument will be used if the globs
// arg is empty. This allows you to dynamically look for args
// passed in at the command line and fallback on a default if 
// there are none.
module.exports = function buildFileArray(globs, defaultGlobs) {
	var files, 
		targets = [];
		
	defaultGlobs = defaultGlobs || [];
		
	if (globs.length === 0) { globs = defaultGlobs; }
		
	globs.forEach(function(glob) {
		files = globber.sync(glob);
		files.forEach(function(expandedFile) {
			targets.push(expandedFile);
		});
	});
	
	return targets;
};