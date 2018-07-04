import test from 'ava';
import fastify from 'fastify';
import parseCsp from 'content-security-policy-parser';
import plugin from '../src/index';
import UA from './ua.json';

const POLICY = {
	defaultSrc: ["'self'"],
	scriptSrc: ['scripts.biz'],
	styleSrc: ['styles.biz', (reqest, reply) => reply.locals.nonce],
	objectSrc: ["'none'"],
	imgSrc: ['data:']
};
const EXPECTED_POLICY = {
	'default-src': ["'self'"],
	'script-src': ['scripts.biz'],
	'style-src': ['styles.biz', 'abc123'],
	'object-src': ["'none'"],
	'img-src': ['data:']
};

test.beforeEach(t => {
	const app = fastify();

	app
		.decorateReply('locals', {})
		.addHook('preHandler', (request, reply, next) => {
			reply.locals.nonce = 'abc123';
			next();
		})
		.get('/', (request, reply) => {
			reply.send('hello world');
		});

	t.context.app = app;
});

const mock = async (t, opts, ua) => {
	const rsp = await t.context.app.register(plugin, opts).inject({
		method: 'get',
		url: '/',
		headers: {
			'User-Agent': ua
		}
	});

	return rsp.headers;
};

Object.entries(UA).forEach(([name, info]) => {
	test(`disable browser sniffing and sets the header properly for ${name}`, async t => {
		const headers = await mock(
			t,
			{
				browserSniff: false,
				directives: POLICY
			},
			info.string
		);

		t.deepEqual(parseCsp(headers['content-security-policy']), EXPECTED_POLICY);
		t.is(headers['x-content-security-policy'], undefined);
		t.is(headers['x-webkit-csp'], undefined);
	});
});

test('disable browser sniffing and set report-only', async t => {
	const headers = await mock(
		t,
		{
			browserSniff: false,
			reportOnly: true,
			directives: POLICY
		},
		UA['Firefox 23'].string
	);

	t.deepEqual(parseCsp(headers['content-security-policy-report-only']), EXPECTED_POLICY);
	t.is(headers['x-content-security-policy'], undefined);
	t.is(headers['x-webkit-csp'], undefined);
});

test('disable browser sniffing and set all headers', async t => {
	const headers = await mock(
		t,
		{
			browserSniff: false,
			setAllHeaders: true,
			directives: POLICY
		},
		UA['Firefox 23'].string
	);

	t.deepEqual(parseCsp(headers['content-security-policy']), EXPECTED_POLICY);
	t.deepEqual(parseCsp(headers['x-content-security-policy']), EXPECTED_POLICY);
	t.deepEqual(parseCsp(headers['x-webkit-csp']), EXPECTED_POLICY);
});
