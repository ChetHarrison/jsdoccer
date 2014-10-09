'use strict';

var doc = require('../../document.js');

console.log(doc._saveFile);

describe('document', function () {
	
	beforeEach(function() {
	    spyOn(doc, 'document');
	    doc.document();
	});
	
	it('should document through document object', function () {
		expect(doc.document).toHaveBeenCalled();
	});
});
