const { typeMap } = require('./type-checker');

const goodBrowser = () => ['Content-Security-Policy'];
const android = ({ osVersion, disableAndroid }) =>
	osVersion < 4.4 || disableAndroid ? [] : ['Content-Security-Policy'];
const chrome = ({ version }) =>
	version >= 14 && version < 25
		? ['X-WebKit-CSP']
		: version >= 25
			? ['Content-Security-Policy']
			: [];
const chromeMobile = opts =>
	opts.osFamily === 'iOS' ? ['Content-Security-Policy'] : android(opts);
const firefox = ({ version }) =>
	version >= 23
		? ['Content-Security-Policy']
		: version >= 4 && version < 23
			? ['X-Content-Security-Policy']
			: [];
const firefoxMobile = ({ osFamily, version }) => {
	if (osFamily === 'Firefox OS') {
		return version < 32 ? ['X-Content-Security-Policy'] : ['Content-Security-Policy'];
	} else if (osFamily === 'Android') {
		return version < 25 ? ['X-Content-Security-Policy'] : ['Content-Security-Policy'];
	}

	return [];
};
const ie = ({ version }) =>
	version < 12 ? ['X-Content-Security-Policy'] : ['Content-Security-Policy'];
const opera = ({ version }) => (version >= 15 ? ['Content-Security-Policy'] : []);
const safari = ({ version }) =>
	version >= 7 ? ['Content-Security-Policy'] : version >= 6 ? ['X-WebKit-CSP'] : [];

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

module.exports = data => {
	const handler = browserHandlers[data.name];
	return handler ? handler(data) : typeMap.allHeaders;
};
