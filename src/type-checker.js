const { isBool, isFun, isStr, isArr } = require('./helper');
const error = require('./error');

const typeMap = {
	directives: {
		baseUri: { type: 'sourceList' },
		blockAllMixedContent: { type: 'boolean' },
		childSrc: { type: 'sourceList' },
		connectSrc: { type: 'sourceList' },
		defaultSrc: {
			type: 'sourceList',
			hasStrictDynamic: true
		},
		fontSrc: { type: 'sourceList' },
		formAction: { type: 'sourceList' },
		frameAncestors: { type: 'sourceList' },
		frameSrc: { type: 'sourceList' },
		imgSrc: { type: 'sourceList' },
		manifestSrc: { type: 'sourceList' },
		mediaSrc: { type: 'sourceList' },
		objectSrc: { type: 'sourceList' },
		scriptSrc: {
			type: 'sourceList',
			hasUnsafes: true,
			hasStrictDynamic: true
		},
		styleSrc: {
			type: 'sourceList',
			hasUnsafes: true
		},
		prefetchSrc: { type: 'sourceList' },
		pluginTypes: { type: 'pluginTypes' },
		sandbox: { type: 'sandbox' },
		reportTo: { type: 'reportUri' },
		reportUri: { type: 'reportUri' },
		requireSriFor: { type: 'requireSriFor' },
		upgradeInsecureRequests: { type: 'boolean' },
		workerSrc: {
			type: 'sourceList',
			hasUnsafes: true
		}
	},
	allHeaders: ['Content-Security-Policy', 'X-Content-Security-Policy', 'X-WebKit-CSP'],
	mustQuote: new Set(['none', 'self', 'unsafe-inline', 'unsafe-eval', 'strict-dynamic']),
	unsafes: new Set(["'unsafe-inline'", 'unsafe-inline', "'unsafe-eval'", 'unsafe-eval']),
	strictDynamics: new Set(["'strict-dynamic'", 'strict-dynamic']),
	requireSriForValues: new Set(['script', 'style']),
	sandboxValues: new Set([
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
	if (value === false) return;
	if (!isArr(value) || value.length === 0) {
		throw error.directiveNotArray(value, name);
	}

	value.forEach(sourceExp => {
		if (isFun(sourceExp)) return;
		if (!sourceExp || !isStr(sourceExp) || sourceExp.length === 0) {
			throw error.directiveNotValidValue(sourceExp, name);
		}
		if (
			(!typeInfo.hasUnsafes && typeMap.unsafes.has(sourceExp)) ||
			(!typeInfo.hasStrictDynamic && typeMap.strictDynamics.has(sourceExp))
		) {
			throw error.directiveNotMakeSense(sourceExp, name);
		}
		if (typeMap.mustQuote.has(sourceExp)) {
			throw error.directiveMustQuoted(sourceExp, name);
		}
	});
};
const checkBoolean = (value, name) => {
	if (!isBool(value)) {
		throw error.directiveNotValidValue(value, name);
	}
};
const checkPluginTypes = (value, name) => {
	if (value === false) return;
	if (!isArr(value) || value.length === 0) {
		throw error.directiveNotArray(value, name);
	}

	const notAllowed = new Set(['self', `'self'`]);

	value.forEach(pluginType => {
		if (isFun(pluginType)) return;
		if (!pluginType || !isStr(pluginType) || pluginType === 0) {
			throw error.directiveNotValidValue(pluginType, name);
		}
		if (typeMap.unsafes.has(pluginType) || notAllowed.has(pluginType)) {
			throw error.directiveNotMakeSense(pluginType, name);
		}
		if (typeMap.mustQuote.has(pluginType)) {
			throw error.directiveMustQuoted(pluginType, name);
		}
	});
};
const checkSandbox = (value, name) => {
	if (isBool(value)) return;
	if (!isArr(value) || value.length === 0) {
		throw error.directiveNotArray(value, name);
	}

	value.forEach(exp => {
		if (isFun(exp)) return;
		if (!typeMap.sandboxValues.has(exp)) throw error.directiveNotValidValue(exp, name);
	});
};
const checkReportUri = (value, name) => {
	if (value === false || isFun(value)) return;
	if (!isStr(value) || value.length === 0) throw error.directiveNotValidValue(value, name);
};
const checkRequireSriFor = (value, name) => {
	if (!isArr(value) || value.length === 0) {
		throw error.directiveNotArray(value, name);
	}

	value.forEach(exp => {
		if (isFun(exp)) return;
		if (!typeMap.requireSriForValues.has(exp)) throw error.directiveNotValidValue(exp, name);
	});
};
const checkMethod = {
	sourceList: checkSourceList,
	pluginTypes: checkPluginTypes,
	sandbox: checkSandbox,
	reportUri: checkReportUri,
	requireSriFor: checkRequireSriFor,
	boolean: checkBoolean
};
const checker = (name, value, typeInfo) => {
	checkMethod[typeInfo.type](value, name, typeInfo);
};

module.exports = { checker, typeMap };
