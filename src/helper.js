const reduce = require('lodash.reduce');

const typeChecker = type => value => Object.prototype.toString.call(value) === `[object ${type}]`;
const isObj = typeChecker('Object');
const isFun = typeChecker('Function');
const isStr = typeChecker('String');
const isBool = typeChecker('Boolean');
const isArr = Array.isArray;
const containsFunction = obj =>
	Object.entries(obj).some(([, value]) => (isArr(value) ? value.some(isFun) : isFun(value)));

const parseDynamicDirectives = (directives, functionArgs) => {
	return reduce(
		directives,
		(result, value, key) => {
			if (Array.isArray(value)) {
				result[key] = value.map(function(element) {
					return isFun(element) ? element.apply(null, functionArgs) : element;
				});
			} else if (isFun(value)) {
				result[key] = value.apply(null, functionArgs);
			} else if (value !== false) {
				result[key] = value;
			}

			return result;
		},
		{}
	);
};

module.exports = { isObj, isFun, isStr, isBool, isArr, containsFunction, parseDynamicDirectives };
