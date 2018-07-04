import test from 'ava';
import fastify from 'fastify';
import plugin from '../src/index';
import errors from '../src/error';

const SOURCELIST_DIRECTIVES = [
	'baseUri',
	'childSrc',
	'connectSrc',
	'defaultSrc',
	'fontSrc',
	'formAction',
	'frameAncestors',
	'frameSrc',
	'imgSrc',
	'manifestSrc',
	'mediaSrc',
	'objectSrc',
	'prefetchSrc',
	'scriptSrc',
	'styleSrc',
	'workerSrc'
];
const SOURCELISTS_WITH_UNSAFES = new Set(['scriptSrc', 'styleSrc', 'workerSrc']);
const SOURCELISTS_WITH_STRICT_DYNAMIC = new Set(['defaultSrc', 'scriptSrc']);
const BOOLEAN_DIRECTIVES = ['blockAllMixedContent', 'upgradeInsecureRequests'];
const PLUGINTYPE_DIRECTIVES = ['pluginTypes'];
const URI_DIRECTIVES = ['reportTo', 'reportUri'];

test.beforeEach(t => {
	const app = fastify();

	app.get('/', (request, reply) => {
		reply.send('hello world');
	});

	t.context.app = app;
});

const register = (t, opts) =>
	t.context.app.register(plugin, opts).inject({ method: 'get', url: '/' });
const assertThrowsWithDirective = (directive, value, errorValue, error) => async t => {
	const directives = {};
	directives[directive] = value;
	await t.throws(register(t, { directives }), error(errorValue, directive).message);
};

// missing directives
[true, 1, 'string', [], [{ directives: {} }]].forEach(arg => {
	test(`non-object argument: ${JSON.stringify(arg)}`, async t => {
		await t.throws(register(t, arg), errors.OPTION_NOT_OBJECT.message);
	});
});

test('argument has no "directives" key', async t => {
	await t.throws(register(t, {}), errors.OPTION_NO_DIRECTIVES.message);
});

test('empty directives object', async t => {
	await t.throws(
		register(t, {
			directives: {}
		}),
		errors.EMPTY_DIRECTIVES.message
	);
});

test('invalid directive type', async t => {
	await t.throws(
		register(t, {
			directives: {
				foobar: ['some data']
			}
		}),
		errors.noSuchDirective('foobar').message
	);
});

// sourcelist directives
SOURCELIST_DIRECTIVES.forEach(directive => {
	[null, undefined, true, {}, 123, '', 'https://foobar.com', () => true].forEach(value => {
		test(
			`sourcelist ${directive} with a non-array: ${value}`,
			assertThrowsWithDirective(directive, value, value, errors.directiveNotArray)
		);
	});

	test(
		`sourcelist ${directive} with an empty array`,
		assertThrowsWithDirective(directive, [], [], errors.directiveNotArray)
	);

	[null, undefined, true, {}, 69].forEach(value => {
		test(
			`sourcelist ${directive} with non-string value in array: ${value}`,
			assertThrowsWithDirective(
				directive,
				['http://foobar.com', value, 'http://foobar.com'],
				value,
				errors.directiveNotValidValue
			)
		);
	});

	const quotedValueList = ['self', 'none'];
	SOURCELISTS_WITH_UNSAFES.has(directive) && quotedValueList.push('unsafe-inline', 'unsafe-eval');
	SOURCELISTS_WITH_STRICT_DYNAMIC.has(directive) && quotedValueList.push('strict-dynamic');
	quotedValueList.forEach(value => {
		test(
			`sourcelist ${directive} with unquoted value`,
			assertThrowsWithDirective(directive, [value], value, errors.directiveMustQuoted)
		);
	});

	if (!SOURCELISTS_WITH_UNSAFES.has(directive)) {
		['unsafe-inline', 'unsafe-eval', "'unsafe-inline'", "'unsafe-eval'"].forEach(value => {
			test(
				`sourcelist ${directive} with unsafe value: ${value}`,
				assertThrowsWithDirective(directive, [value], value, errors.directiveNotMakeSense)
			);
		});
	}

	if (!SOURCELISTS_WITH_STRICT_DYNAMIC.has(directive)) {
		['strict-dynamic', "'strict-dynamic'"].forEach(value => {
			test(
				`sourcelist ${directive} with unsafe value: ${value}`,
				assertThrowsWithDirective(directive, [value], value, errors.directiveNotMakeSense)
			);
		});
	}
});

// boolean directives
BOOLEAN_DIRECTIVES.forEach(directive => {
	[null, undefined, {}, [], 123, '', 'true', 'false', [true]].forEach(value => {
		test(
			`boolean ${directive} with non-boolean: ${value}`,
			assertThrowsWithDirective(directive, value, value, errors.directiveNotValidValue)
		);
	});
});

// plugin directives
PLUGINTYPE_DIRECTIVES.forEach(directive => {
	[null, undefined, true, {}, 123, '', 'https://foobar.com', () => true].forEach(value => {
		test(
			`plugin ${directive} with a non-array: ${value}`,
			assertThrowsWithDirective(directive, value, value, errors.directiveNotArray)
		);
	});

	test(
		`plugin ${directive} with an empty array`,
		assertThrowsWithDirective(directive, [], [], errors.directiveNotArray)
	);

	test(
		`plugin ${directive} with unquoted value`,
		assertThrowsWithDirective(directive, ['none'], 'none', errors.directiveMustQuoted)
	);

	['self', 'unsafe-inline', 'unsafe-eval', "'self'", "'unsafe-inline'", "'unsafe-eval'"].forEach(
		value => {
			test(
				`plugin ${directive} with no sense value: ${value}`,
				assertThrowsWithDirective(directive, [value], value, errors.directiveNotMakeSense)
			);
		}
	);
});

// uri directives
URI_DIRECTIVES.forEach(directive => {
	[null, undefined, true, {}, [], 69, { length: 2 }, ''].forEach(value => {
		test(
			`uri ${directive} with non-string value: ${value}`,
			assertThrowsWithDirective(directive, value, value, errors.directiveNotValidValue)
		);
	});
});

// requireSriFor directives
['requireSriFor'].forEach(directive => {
	[null, undefined, true, {}, 123, '', 'script', () => true].forEach(value => {
		test(
			`requireSriFor ${directive} with a non-array: ${value}`,
			assertThrowsWithDirective(directive, value, value, errors.directiveNotArray)
		);
	});

	test(
		`requireSriFor ${directive} with an empty array`,
		assertThrowsWithDirective(directive, [], [], errors.directiveNotArray)
	);

	[undefined, 123, 'self', "'self'", 'none', "'none'"].forEach(value => {
		test(
			`requireSriFor ${directive} with unsupported in array: ${value}`,
			assertThrowsWithDirective(
				directive,
				[value],
				value,
				errors.directiveNotValidValue
			)
		);
	});
});

// sandbox directives
['sandbox'].forEach(directive => {
	[null, undefined, {}, '', 0, 1].forEach(value => {
		test(
			`sandbox ${directive} with a non-array: ${value}`,
			assertThrowsWithDirective(directive, value, value, errors.directiveNotArray)
		);
	});

	test(
		`sandbox ${directive} with an empty array`,
		assertThrowsWithDirective(directive, [], [], errors.directiveNotArray)
	);

	[undefined, 123, 'self', "'self'", 'none', "'none'"].forEach(value => {
		test(
			`sandbox ${directive} with unsupported in array: ${value}`,
			assertThrowsWithDirective(
				directive,
				[value],
				value,
				errors.directiveNotValidValue
			)
		);
	});
});
