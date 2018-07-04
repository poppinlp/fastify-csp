import test from 'ava';
import fastify from 'fastify';
import parseCsp from 'content-security-policy-parser';
import plugin from '../src/index';
import UA from './ua.json';

const POLICY = {
	directives: {
		defaultSrc: ["'self'"],
		scriptSrc: ['scripts.biz'],
		styleSrc: ['styles.biz', (request, reply) => reply.locals.nonce],
		objectSrc: ["'none'"],
		imgSrc: ['data:'],
		mediaSrc: false,
		prefetchSrc: ['prefetch.example.com'],
		reportTo: '/report',
		requireSriFor: ['script'],
		upgradeInsecureRequests: true
	}
};
const EXPECTED_POLICY = {
	'default-src': ["'self'"],
	'script-src': ['scripts.biz'],
	'style-src': ['styles.biz', 'abc123'],
	'object-src': ["'none'"],
	'img-src': ['data:'],
	'prefetch-src': ['prefetch.example.com'],
	'report-to': ['/report'],
	'require-sri-for': ['script'],
	'upgrade-insecure-requests': []
};

test.beforeEach(t => {
	const app = fastify();

	app.get('/', (request, reply) => {
		reply.send('hello world');
	});

	t.context.app = app;
});

const mock = async (t, opts, ua) => {
	const rsp = await t.context.app
		.register(plugin, opts)
		.inject({
			method: 'get',
			url: '/',
			headers: {
				'User-Agent': ua
			}
		});

	return rsp.headers;
};

// firefox
[
	'Firefox 22',
	'Firefox OS 1.4',
	'Firefox for Android 24'
].forEach(name => {
	test(`sets the header properly for ${name}`, async t => {
		const headers = await mock(t, {
			directives: {
				defaultSrc: ["'self'"],
				connectSrc: ['connect.com']
			}
		}, UA[name].string);

		t.deepEqual(parseCsp(headers['x-content-security-policy']), {
			'default-src': ["'self'"],
			'xhr-src': ['connect.com']
		})
	});
});

// safari
[
	'Safari 4.1',
	'Safari 5.1 on OS X',
	'Safari 5.1 on Windows Server 2008'
].forEach(name => {
	test(`doesn't set the header for ${name}`, async t => {
		const headers = await mock(t, {
			directives: {
				defaultSrc: ["'self'"]
			}
		}, UA[name].string);

		[
			'content-security-policy',
			'x-content-security-policy',
			'x-webkit-csp'
		].forEach(name => {
			t.is(headers[name], undefined);
		});
	})
});

// android
test(`android can be disabled`, async t => {
	const headers = await mock(t, {
		disableAndroid: true,
		directives: {
			defaultSrc: ['a.com']
		}
	}, UA['Android 4.4.3'].string);

	[
		'content-security-policy',
		'x-content-security-policy',
		'x-webkit-csp'
	].forEach(name => {
		t.is(headers[name], undefined);
	});
});
