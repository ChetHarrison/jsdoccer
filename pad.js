// simple example of the decorator pattern.
'use strict';

var doccer = {
		init: function(options) {
			options = options || {};
			this.src = options.src;
			this.decorTargets = options.decorTargets || [];	
		},
		
		getSrc: function() {
			this.decorTargets.forEach(function(decor) {
				this.src = this.decorations[decor](this.src);
			}, this);
			return this.src;
		},
		
		decorTargets: [],
		
		addDecor: function(decor) {
			this.decorTargets.push(decor);
		},
		
		decorations: {
			addPeriod: function(src) { return src += '.'; },
			
			addChet: function(src) { return src += 'Chet'; }
		}
	};
	
doccer.init({
	src: 'Howdy! I\'m '
});

console.log(doccer.getSrc());

doccer.addDecor('addChet');
doccer.addDecor('addPeriod');

console.log(doccer.getSrc());

// Howdy! I'm 
// Howdy! I'm Chet.

