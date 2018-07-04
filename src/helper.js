const typeChecker = type => value => Object.prototype.toString.call(value) === `[object ${type}]`;
const isObj = typeChecker('Object');
const isFun = typeChecker('Function');
const isStr = typeChecker('String');
const isBool = typeChecker('Boolean');
const isArr = Array.isArray;
const containsFunction = obj => {
	const keyList = Object.keys(obj);

	for (let i = 0; i < keyList.length; i++) {
		const value = obj[keyList[i]];

		if (isFun(value)) return true;
		if (isArr(value)) {
			for (let j = 0; j < value.length; j++) {
				if (isFun(value[j])) return true;
			}
		}
	}

	return false;
};

const parseDynamicDirectives = (directives, request, reply) => {
	const keyList = Object.keys(directives);
	const ret = {};

	for (let i = 0; i < keyList.length; i++) {
		const key = keyList[i];
		const value = directives[key];

		if (isArr(value)) {
			ret[key] = value.map(element => {
				return isFun(element) ? element(request, reply) : element;
			});
		} else if (isFun(value)) {
			ret[key] = value(request, reply);
		} else if (value !== false) {
			ret[key] = value;
		}
	}

	return ret;
};

module.exports = { isObj, isFun, isStr, isBool, isArr, containsFunction, parseDynamicDirectives };
