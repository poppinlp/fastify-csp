const { isBool, isFun, isStr, isArr } = require('./helper');

const typeMap = {
	directives: {
		'base-uri': { type: 'sourceList' },
		'block-all-mixed-content': { type: 'boolean' },
		'child-src': { type: 'sourceList' },
		'connect-src': { type: 'sourceList' },
		'default-src': {
			type: 'sourceList',
			hasStrictDynamic: true
		},
		'font-src': { type: 'sourceList' },
		'form-action': { type: 'sourceList' },
		'frame-ancestors': { type: 'sourceList' },
		'frame-src': { type: 'sourceList' },
		'img-src': { type: 'sourceList' },
		'manifest-src': { type: 'sourceList' },
		'media-src': { type: 'sourceList' },
		'object-src': { type: 'sourceList' },
		'script-src': {
			type: 'sourceList',
			hasUnsafes: true,
			hasStrictDynamic: true
		},
		'style-src': {
			type: 'sourceList',
			hasUnsafes: true
		},
		'prefetch-src': { type: 'sourceList' },
		'plugin-types': { type: 'pluginTypes' },
		sandbox: { type: 'sandbox' },
		'report-to': { type: 'reportUri' },
		'report-uri': { type: 'reportUri' },
		'require-sri-for': { type: 'requireSriFor' },
		'upgrade-insecure-requests': { type: 'boolean' },
		'worker-src': {
			type: 'sourceList',
			hasUnsafes: true
		}
	},
	allHeaders: ['Content-Security-Policy', 'X-Content-Security-Policy', 'X-WebKit-CSP'],
	mustQuote: new Set(['none', 'self', 'unsafe-inline', 'unsafe-eval', 'strict-dynamic']),
	unsafes: new Set(["'unsafe-inline'", 'unsafe-inline', "'unsafe-eval'", 'unsafe-eval']),
	strictDynamics: new Set(["'strict-dynamic'", 'strict-dynamic']),
	requireSriForValues: new Set(['script', 'style']),
	sandboxDirectives: new Set([
		'allow-forms',
		'allow-modals',
		'allow-orientation-lock',
		'allow-pointer-lock',
		'allow-popups',
		'allow-popups-to-escape-sandbox',
		'allow-presentation',
		'allow-same-origin',
		'allow-scripts',
		'allow-top-navigation'
	])
};

const checkSourceList = (value, name, typeInfo) => {
	if (value === false) return true;
	if (!isArr(value) || value.length === 0) return false;

	value.forEach(sourceExp => {
		if (isFun(sourceExp)) return;
		if (!sourceExp || !isStr(sourceExp) || sourceExp.length === 0) {
			throw new Error(`"${sourceExp}" is not a valid expression in ${name}.`);
		}
		if (
			(!typeInfo.hasUnsafes && typeMap.unsafes.has(sourceExp)) ||
			(!typeInfo.hasStrictDynamic && typeMap.strictDynamics.has(sourceExp))
		) {
			throw new Error(`"${sourceExp}" does not make sense in ${name}.`);
		}
		if (typeMap.mustQuote.has(sourceExp)) {
      throw new Error(`"${sourceExp}" must be quoted in ${name}. Change it to "'${sourceExp}'" in your option.`)
    }
	});

	return true;
};
const checkPluginTypes = (value, name) => {
	if (value === false) return true;
	if (!isArr(value) || value.length === 0) return false;
	const notAllowed = new Set(['self', `'self'`]);

	value.forEach(pluginType => {
		if (isFun(pluginType)) return;
		if (!pluginType || !isStr(pluginType) || pluginType === 0) {
			throw new Error(`"${pluginType}" is not a valid expression in ${name}.`);
		}
		if (typeMap.unsafes.has(pluginType) || notAllowed.has(pluginType)) {
			throw new Error(`"${pluginType}" does not make sense in ${name}.`);
		}
		if (typeMap.mustQuote.has(pluginType)) {
      throw new Error(`"${pluginType}" must be quoted in ${name}. Change it to "'${pluginType}'" in your option.`)
    }
	});

	return true;
};
const checkSandbox = (value, name) => {
	if (isBool(value)) return true;
	if (!isArr(value) || value.length === 0) return false;

	value.forEach(exp => {
		if (isFun(exp)) return;
		if (typeMap.sandboxDirectives.has(exp)) {
			throw new Error(`"${exp}" is not a valid directive in ${name}.`)
		}
	});

	return true;
};
const checkReportUri = (value, name) => {
	if (value === false || isFun(value)) return true;
	if (!isStr(value) || value.length === 0) {
		throw new Error(`"${value}" is not a valid value for ${name}.`);
	}
};
const checkRequireSriFor = (value, name) => {
	if (!isArr(value) || value.length === 0) return false;

	value.forEach(exp => {
		if (isFun(exp)) return;
		if (typeMap.requireSriForValues.has(exp)) {
			throw new Error(`"${exp}" is not a valid value in ${name}.`);
		}
	});

	return true;
};
const checkMethod = {
	sourceList: checkSourceList,
	pluginTypes: checkPluginTypes,
	sandbox: checkSandbox,
	reportUri: checkReportUri,
	requireSriFor: checkRequireSriFor,
	boolean: isBool
};
const checker = (name, value, typeInfo) => {
	if (!checkMethod[typeInfo.type](value, name, typeInfo)) {
		throw new TypeError(`"${value}" is not a valid value for ${name}`);
	}
};

module.exports = { checker, typeMap };
