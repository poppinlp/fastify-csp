const { allHeaders } = require('./type-checker');

const goodBrowser = () => ['Content-Security-Policy'];
const android = (browser, opts) =>
	parseFloat(browser.os.version) < 4.4 || opts.disableAndroid ? [] : ['Content-Security-Policy'];
const chrome = browser => {
	const version = parseFloat(browser.version);
	return version >= 14 && version < 25
		? ['X-WebKit-CSP']
		: version >= 25
			? ['Content-Security-Policy']
			: [];
};
const chromeMobile = (browser, opts) =>
	browser.os.family === 'iOS' ? ['Content-Security-Policy'] : android(browser, opts);
const firefox = browser => {
	const version = parseFloat(browser.version);
	return version >= 23
		? ['Content-Security-Policy']
		: version >= 4 && version < 23
			? ['X-Content-Security-Policy']
			: [];
};
const firefoxMobile = browser => {
	// Handles both Firefox for Android and Firefox OS
	const { family } = browser.os;
	const version = parseFloat(browser.version);

	if (family === 'Firefox OS') {
		return version < 32 ? ['X-Content-Security-Policy'] : ['Content-Security-Policy'];
	} else if (family === 'Android') {
		return version < 25 ? ['X-Content-Security-Policy'] : ['Content-Security-Policy'];
	}

	return [];
};
const ie = browser => {
	const version = parseFloat(browser.version);
	return version < 12 ? ['X-Content-Security-Policy'] : ['Content-Security-Policy'];
};
const opera = browser => parseFloat(browser.version) >= 15 ? ['Content-Security-Policy'] : [];
const safari = browser => {
	const version = parseFloat(browser.version);

	return version >= 7
		? ['Content-Security-Policy']
		: version >= 6
			? ['X-WebKit-CSP']
			: [];
};

const browserHandlers = {
	'Android Browser': android,
	Chrome: chrome,
	'Chrome Mobile': chromeMobile,
	Firefox: firefox,
	'Firefox Mobile': firefoxMobile,
	'Firefox for iOS': goodBrowser,
	IE: ie,
	'IE Mobile': ie,
	'Microsoft Edge': goodBrowser,
	'Microsoft Edge Mobile': goodBrowser,
	Opera: opera,
	Safari: safari
};

module.exports = (browser, opts) => {
	const handler = browserHandlers[browser.name];
	return handler ? handler(browser, opts) : allHeaders;
};
