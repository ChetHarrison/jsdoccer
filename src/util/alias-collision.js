'use strict';

var _ = require('lodash'),
	_reserveWords = [
		// javescript
		'abstract',
		'arguments',
		'boolean',
		'break',
		'byte',
		'case',
		'catch',
		'char',
		'class',
		'const',
		'continue',
		'debugger',
		'default',
		'delete',
		'do',
		'double',
		'else',
		'enum',
		'eval',
		'export',
		'extends',
		'false',
		'final',
		'finally',
		'float',
		'for',
		'function',
		'goto',
		'if',
		'implements',
		'import',
		'in',
		'instanceof',
		'int',
		'interface',
		'let',
		'long',
		'native',
		'new',
		'null',
		'package',
		'private',
		'protected',
		'public',
		'return',
		'short',
		'static',
		'super',
		'switch',
		'synchronized',
		'this',
		'throw',
		'throws',
		'transient',
		'true',
		'try',
		'typeof',
		'var',
		'void',
		'volatile',
		'while',
		'with',
		'yield',
		// functions
		'constructor'
	],
	
	
	_reserveWordPrefix = 'reserve_',
	
	
	_prefixLength = _reserveWordPrefix.length,
	
	
	_isPrefixed = function(word) {
		var prefix;
			
		if (word.length < _prefixLength) { return false; }
		
		prefix = word.slice(0, _prefixLength);
		
		if (prefix === _reserveWordPrefix) { return true; }
		
		return false;
	},
	
	
	alias =  {
		setPrefix: function(prefix) {
			_reserveWordPrefix = prefix;
			_prefixLength = _reserveWordPrefix.length;
		},
		
		
		getPrefix: function(prefix) {
			return _reserveWordPrefix;
		},
		
		
		addReserveWords: function(words) {
			if (_.isString(words)) {
				words = [words];
			}
			_reserveWords = _.union(_reserveWords, words);
		},
		
		
		prefix: function(word) {
			if (_isPrefixed(word)) { return word; } // idempotent
			
			if (_.contains(_reserveWords, word)) {
				word = _reserveWordPrefix + word;
			}
			
			return word;
		},
		
		
		unPrefix: function(word) {
			if (!_isPrefixed(word)) { return word; } // idempotent
			
			return word.slice(_prefixLength);
		}
	};

module.exports = alias;


	
