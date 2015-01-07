// jsonWalker
// walk a json object and apply a decorator function to all
// string values.
// Example:
// jsonWalker.walk(json, function(node){ doSomthingToNode; });
// your json's strings are now decorated
'use strict';

var _ = require('lodash'),
	walk = function(node, targetKey, valueDecorator) {
		if (_.isObject(node)) {
			var keys = _.keys(node);
			_.each(keys, function(key) {
				var value = node[key]; 
				if (_.isString(value) && key === targetKey) {
					node[key] = valueDecorator(value);
				}
				else {
					walk(value, targetKey, valueDecorator);
				}
			}, this);
		}
	};

module.exports = walk;