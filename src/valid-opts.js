const error = require('./error');
const { checker, typeMap } = require('./type-checker');
const { isObj } = require('./helper');

module.exports = opts => {
	if (!isObj(opts)) throw error.OPTION_NOT_OBJECT;
	if (!isObj(opts.directives)) throw error.OPTION_NO_DIRECTIVES;

	const keyList = Object.keys(opts.directives);

	if (keyList.length === 0) throw error.EMPTY_DIRECTIVES;
	if (opts.loose) return;

	for (let i = 0; i < keyList.length; i++) {
		const name = keyList[i];
		const directive = opts.directives[name];
		const typeInfo = typeMap.directives[name];

		if (!typeInfo) throw error.noSuchDirective(name);
		checker(name, directive, typeInfo);
	}
};
