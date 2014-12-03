'use strict';

var glob = require('glob');

module.exports = function buildFileArray(files) {
	var expandedFiles, 
		qualifiedFiles = [];
		
	files.forEach(function(file) {
		expandedFiles = glob.sync(file);
	});
	expandedFiles.forEach(function(expandedFile) {
		qualifiedFiles.push(expandedFile);
	});
	
	return qualifiedFiles;
};