const { isArr } = require('./helper');
const dashify = str => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

module.exports = directives => {
	const keyList = Object.keys(directives);
	const result = [];

	for (let i = 0; i < keyList.length; i++) {
		const key = keyList[i];
		const value = directives[key];

		if (value === false) continue;

		const directive = dashify(key);
		const directiveValue = isArr(value) ? value.join(' ') : value === true ? '' : value;

		result.push(directiveValue ? `${directive} ${directiveValue}` : directive);
	}

	return result.join('; ');
};
