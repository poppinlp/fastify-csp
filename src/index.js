const fp = require('fastify-plugin');
const platform = require('platform');
const kebab = require('lodash.kebabcase');
const camelize = require('camelize');
const cspBuilder = require('content-security-policy-builder');

const { isObj, isFun, containsFunction, parseDynamicDirectives } = require('./helper');
const getHeaderKeysForBrowser = require('./sniff-header');
const transformDirectivesForBrowser = require('./sniff-directive');
const { checker, typeMap } = require('./type-checker');

const checkOptions = opts => {
	if (!isObj(opts)) {
		throw new TypeError('The passed in option should be an object.');
	}
	if (!isObj(opts.directives)) {
		throw new TypeError('The passed in option should have "directives" key as an object.');
	}

	const directives = Object.entries(opts.directives);

	if (directives.length === 0) {
		throw new Error('The directives object should have at least one directive.');
	}

	!opts.loose && directives.forEach(([key, directive]) => {
		const name = kebab(key);

		if (!typeMap.directives[name]) {
			throw new Error(`No such directive named ${name}.`);
		}
		checker(name, directive, typeMap.directives[name]);
	});
};

const csp = (app, opts = {}, next) => {
	checkOptions(opts);

	const originalDirectives = camelize(opts.directives || {});
	const directivesAreDynamic = containsFunction(originalDirectives);
	const reportOnlyIsFunction = isFun(opts.reportOnly)

	const noSniffHeaderKeys = opts.setAllHeaders ? typeMap.allHeaders : ['Content-Security-Policy'];

	app.addHook('onSend', (request, reply, payload, next) => {
		let headerKeys;

		if (opts.browserSniff) {
			const ua = request.headers['user-agent'];
			const browser = ua ? platform.parse(ua) : {};

			headerKeys = (opts.setAllHeaders || !ua) ? typeMap.allHeaders : getHeaderKeysForBrowser(browser, opts);

			if (headerKeys.length === 0) {
				next();
				return;
			}

			let directives = transformDirectivesForBrowser(browser, originalDirectives)

			if (directivesAreDynamic) {
				directives = parseDynamicDirectives(directives, [request, reply])
			}

			const policyString = cspBuilder({ directives })

			headerKeys.forEach(headerKey => {
				let header = headerKey;

				if (
					(reportOnlyIsFunction && opts.reportOnly(request, reply)) ||
					(!reportOnlyIsFunction && opts.reportOnly)
				) {
					header += '-Report-Only'
				}

				reply.header(header, policyString)
			});
		} else {
			const directives = parseDynamicDirectives(originalDirectives, [request, reply]);
			const policyString = cspBuilder({ directives });

			noSniffHeaderKeys.forEach(headerKey => {
				let header = headerKey;

				if (
					(reportOnlyIsFunction && opts.reportOnly(request, reply)) ||
					(!reportOnlyIsFunction && opts.reportOnly)
				) {
					header += '-Report-Only'
				}

				reply.header(header, policyString)
			});
		}

		next();
	});

	next();
};

module.exports = fp(csp, {
	fastify: '^1.0.0',
	name: 'fastify-csp'
});
