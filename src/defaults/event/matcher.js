'use strict';
/*jshint -W030 */

require('rx-array');

module.exports = function(ast) {

    var events,
    	json = [ast].
        	filter(function(exp) {
        		return exp.type === 'ExpressionStatement' &&
        			exp.expression.type &&
	            	exp.expression.type === 'CallExpression' &&
	            	exp.expression.callee &&
	            	exp.expression.callee.object &&
	            	exp.expression.callee.object.type &&
	            	exp.expression.callee.object.type === 'ThisExpression' &&
	            	exp.expression.callee.property &&
	            	exp.expression.callee.property.type === 'Identifier' &&
	            	exp.expression.callee.property.name === 'triggerMethod';
            }).
            map(function(exp) {
            	return {
            		exp: exp,
            		eventName: exp.expression.arguments.
	            		filter(function(arg) {
	            			return arg.type === 'Literal';
	            		}).
	            		map(function(arg) {
	            			return arg.value;
	            		}).pop()
            	};
            }).
            filter(function(obj) {
            	return obj.eventName;
            }).
            map(function(obj) {
            	return { name: obj.eventName };
            });
    	
    if (json.length > 0) {
		events = json.pop();
	} else {
		events = false;	
	}
	
	return events;
}; 