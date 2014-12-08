// registry
// Use by delegation. Example:
// var myHash = Object.create(registry);
'use strict';

module.exports = {
	init: function(options) {
		options = options || [];
		this._values = options.values;
		this._defaultValue = options.defaultValue || null;
	},
	
	register: function(name, value) {
		this._values[name] = value; 
	},
	
	getValue: function(name) {
		if (this._values.indexOf(name) >= 0) {
			return this._values[name];
		} else {
			return this._defaultValue;
		}
	}
};