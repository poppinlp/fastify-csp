const fp = require('fastify-plugin');
const platform = require('platform');

const { isFun, containsFunction, parseDynamicDirectives } = require('./helper');
const { typeMap } = require('./type-checker');
const getHeaderKeysForBrowser = require('./sniff-header');
const transformDirectivesForBrowser = require('./sniff-directive');
const validOpts = require('./valid-opts');
const cspBuilder = require('./csp-builder');

const csp = (app, opts, next) => {
	opts.browserSniff = opts.browserSniff === undefined ? true : opts.browserSniff;

	try {
		validOpts(opts);
	} catch (err) {
		next(err);
		return;
	}

	const directivesAreDynamic = containsFunction(opts.directives);
	const reportOnlyIsFunction = isFun(opts.reportOnly);
	const noSniffHeaderKeys = opts.setAllHeaders ? typeMap.allHeaders : ['Content-Security-Policy'];
	const staticNoSniffPolicy = cspBuilder(opts.directives);
	const cache = directivesAreDynamic ? {} : require('lru-cache')({
		max: 1000
	});

	app.addHook('onSend', (request, reply, payload, next) => {
		const ua = request.headers['user-agent'];

		let headerKeys;
		let policy;

		if (!opts.browserSniff || !ua) {
			headerKeys = noSniffHeaderKeys;
			policy = directivesAreDynamic
				? cspBuilder(parseDynamicDirectives(opts.directives, request, reply))
				: staticNoSniffPolicy;
		} else if (!directivesAreDynamic && cache.has(ua)) {
			const cacheData = cache.get(ua);
			headerKeys = cacheData.headerKeys;
			policy = cacheData.policy;
		} else {
			const browser = platform.parse(ua);
			const sniffData = {
				name: browser.name,
				version: parseFloat(browser.version),
				osVersion: browser.os.version,
				osFamily: browser.os.family,
				disableAndroid: opts.disableAndroid
			};

			headerKeys = opts.setAllHeaders ? typeMap.allHeaders : getHeaderKeysForBrowser(sniffData);

			if (headerKeys.length === 0) {
				next();
				return;
			}

			const directives = transformDirectivesForBrowser(sniffData, opts.directives);

			policy = directivesAreDynamic
				? cspBuilder(parseDynamicDirectives(directives, request, reply))
				: cspBuilder(directives);

			!directivesAreDynamic && cache.set(ua, { headerKeys, policy });
		}

		for (let i = 0; i < headerKeys.length; i++) {
			const header = headerKeys[i];
			const isReportOnly =
				(reportOnlyIsFunction && opts.reportOnly(request, reply)) ||
				(!reportOnlyIsFunction && opts.reportOnly);
			reply.header(isReportOnly ? `${header}-Report-Only` : header, policy);
		}

		next();
	});

	next();
};

module.exports = fp(csp, {
	fastify: '^1.0.0',
	name: 'fastify-csp'
});
