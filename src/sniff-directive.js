const createFirefoxPreCSP10Directives = (directives, basePolicy) =>
	Object.entries(directives).reduce((result, [key, value]) => {
		result[key === 'connectSrc' ? 'xhrSrc' : key] = value;

		if (key === 'scriptSrc') {
			const optionsValues = [];

			value.includes("'unsafe-inline'") && optionsValues.push('inline-script');
			value.includes("'unsafe-eval'") && optionsValues.push('eval-script');

			if (optionsValues.length !== 0) {
				result.options = optionsValues;
			}
		}

		return result;
	}, basePolicy);

const firefox = ({ version }, directives) => {
	if (version < 4 || version >= 23) return directives;
	if (version >= 5)
		return createFirefoxPreCSP10Directives(directives, {
			defaultSrc: ['*']
		});

	const basePolicy = {
		allow: ['*']
	};

	if (directives.defaultSrc) {
		basePolicy.allow = directives.defaultSrc;
		delete directives.defaultSrc;
	}

	return createFirefoxPreCSP10Directives(directives, basePolicy);
};

const firefoxMobile = ({ version, osFamily }, directives) => {
	if ((osFamily === 'Firefox OS' && version < 32) || (osFamily === 'Android' && version < 25)) {
		return createFirefoxPreCSP10Directives(directives, {
			defaultSrc: ['*']
		});
	}

	return directives;
};

const browserHandlers = {
	Firefox: firefox,
	'Firefox Mobile': firefoxMobile
};

module.exports = (data, directives) => {
	const handler = browserHandlers[data.name];
	return handler ? handler(data, directives) : directives;
};
