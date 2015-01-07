// registry pattern
// good stuff from http://lostechies.com/derickbailey/2014/01/28/killing-switch-statements-with-a-registry-an-example-and-screencast/
// with good stuff from Kyle Simpson
// Use by delegation. Example:
// var myHash = Object.create(registry);
// myHash.init({
	// values: {
		// 'foo': function() { ... }
	// }
// }) before use
'use strict';

module.exports = {
	init: function(options) {
		options = options || {};
		this._values = options.values || Object.create( null );
		this._defaultValue = options.defaultValue || null;
	},
	
	register: function(name, value) {
		this._values[name] = value; 
	},
	
	getValue: function(name) {
		var value = this._values[name];
		if (value) {
			return value;
		} else {
			return this._defaultValue;
		}
	}
};