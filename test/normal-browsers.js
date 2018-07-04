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

	app
		.decorateReply('locals', {})
		.addHook('preHandler', (request, reply, next) => {
			reply.locals.nonce = 'abc123';
			next();
		})
		.register(plugin, POLICY)
		.get('/', (request, reply) => {
			reply.send('hello world');
		});

	t.context.app = app;
});

const mock = async (t, ua) => {
	const rsp = await t.context.app.inject({
		method: 'get',
		url: '/',
		headers: {
			'User-Agent': ua
		}
	});
	return rsp.headers;
};

Object.entries(UA).forEach(([name, info]) => {
	if (info.special) return;

	test(`sets the header properly for ${name}`, async t => {
		const headers = await mock(t, info.string);
		const header = headers[info.header.toLocaleLowerCase()];
		t.deepEqual(parseCsp(header), EXPECTED_POLICY);
	});

	test(`dose not set other headers for ${name}`, async t => {
		const headers = await mock(t, info.string);
		[
			'content-security-policy',
			'x-content-security-policy',
			'x-webkit-csp'
		].forEach(name => {
			if (name === info.header.toLowerCase()) return;
			t.is(headers[name], undefined);
		});
	})
});
