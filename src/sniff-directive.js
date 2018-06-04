const reduce = require('lodash.reduce');

function createFirefoxPreCSP10Directives(directives, basePolicy) {
	return reduce(
		directives,
		(result, value, key) => {
			if (key === 'connectSrc') {
				result.xhrSrc = value;
			} else {
				result[key] = value;
			}

			if (key === 'scriptSrc') {
				const optionsValues = [];

				if (value.indexOf("'unsafe-inline'") !== -1) {
					optionsValues.push('inline-script');
				}
				if (value.indexOf("'unsafe-eval'") !== -1) {
					optionsValues.push('eval-script');
				}

				if (optionsValues.length !== 0) {
					result.options = optionsValues;
				}
			}

			return result;
		},
		basePolicy
	);
}

const firefox = (browser, directives) => {
	const version = parseFloat(browser.version);
	const basePolicy = {};

	if (version < 4 || version >= 23) {
		return directives;
	}

	if (version < 5) {
		basePolicy.allow = ['*'];

		if (directives.defaultSrc) {
			basePolicy.allow = directives.defaultSrc;
			delete directives.defaultSrc;
		}
	} else {
		basePolicy.defaultSrc = ['*'];
	}

	return createFirefoxPreCSP10Directives(directives, basePolicy);
};
const firefoxMobile = (browser, directives) => {
	// Handles both Firefox for Android and Firefox OS
	const { family } = browser.os;
	const version = parseFloat(browser.version);

	if ((family === 'Firefox OS' && version < 32) || (family === 'Android' && version < 25)) {
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

module.exports = (browser, directives) => {
	const handler = browserHandlers[browser.name];
	return handler ? handler(browser, directives) : directives;
};
