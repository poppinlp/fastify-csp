import test from 'ava';
import fastify from 'fastify';
import parseCsp from 'content-security-policy-parser';
import plugin from '../src/index';
import UA from './ua.json';

const POLICY = {
	defaultSrc: ["'self'"],
	scriptSrc: ['scripts.biz'],
	styleSrc: ['styles.biz', (request, reply) => reply.locals.nonce],
	objectSrc: ["'none'"],
	imgSrc: ['data:']
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

test('can set all headers', async t => {
	const headers = await mock(
		t,
		{
			setAllHeaders: true,
			directives: {
				defaultSrc: ["'self'", 'domain.com']
			}
		},
		UA['Firefox 23'].string
	);

	t.is(headers['x-content-security-policy'], "default-src 'self' domain.com");
	t.is(headers['content-security-policy'], "default-src 'self' domain.com");
	t.is(headers['x-webkit-csp'], "default-src 'self' domain.com");
});

test('set all headers if provide an unknow user-agent', async t => {
	const headers = await mock(
		t,
		{
			directives: {
				defaultSrc: ["'self'", 'domain.com']
			}
		},
		'unknow user agent'
	);

	t.is(headers['x-content-security-policy'], "default-src 'self' domain.com");
	t.is(headers['content-security-policy'], "default-src 'self' domain.com");
	t.is(headers['x-webkit-csp'], "default-src 'self' domain.com");
});

test('set all headers if no user-agent', async t => {
	const headers = await mock(t, {
		directives: {
			defaultSrc: ["'self'", 'domain.com']
		}
	});

	t.is(headers['x-content-security-policy'], "default-src 'self' domain.com");
	t.is(headers['content-security-policy'], "default-src 'self' domain.com");
	t.is(headers['x-webkit-csp'], "default-src 'self' domain.com");
});

test('can set the report-only headers', async t => {
	const headers = await mock(
		t,
		{
			reportOnly: true,
			setAllHeaders: true,
			directives: {
				defaultSrc: ["'self'", 'domain.com']
			}
		},
		UA['Firefox 23'].string
	);

	t.is(headers['x-content-security-policy-report-only'], "default-src 'self' domain.com");
	t.is(headers['content-security-policy-report-only'], "default-src 'self' domain.com");
	t.is(headers['x-webkit-csp-report-only'], "default-src 'self' domain.com");
	t.is(headers['content-security-policy'], undefined);
	t.is(headers['x-content-security-policy'], undefined);
	t.is(headers['x-webkit-csp'], undefined);
});

test('can use a function to set the report-only headers to true', async t => {
	const headers = await mock(
		t,
		{
			reportOnly: () => true,
			setAllHeaders: true,
			directives: {
				defaultSrc: ["'self'"],
				reportUri: '/reporter'
			}
		},
		UA['Firefox 23'].string
	);

	const expected = {
		'default-src': ["'self'"],
		'report-uri': ['/reporter']
	};

	t.is(headers['content-security-policy'], undefined);
	t.is(headers['x-content-security-policy'], undefined);
	t.is(headers['x-webkit-csp'], undefined);

	t.deepEqual(parseCsp(headers['content-security-policy-report-only']), expected);
	t.deepEqual(parseCsp(headers['x-content-security-policy-report-only']), expected);
	t.deepEqual(parseCsp(headers['x-webkit-csp-report-only']), expected);
});

test('can use a function to set the report-only headers to false', async t => {
	const headers = await mock(
		t,
		{
			reportOnly: () => false,
			setAllHeaders: true,
			directives: {
				defaultSrc: ["'self'", 'domain.com']
			}
		},
		UA['Firefox 23'].string
	);

	t.is(headers['x-content-security-policy'], "default-src 'self' domain.com");
	t.is(headers['content-security-policy'], "default-src 'self' domain.com");
	t.is(headers['x-webkit-csp'], "default-src 'self' domain.com");
	t.is(headers['content-security-policy-report-only'], undefined);
	t.is(headers['x-content-security-policy-report-only'], undefined);
	t.is(headers['x-webkit-csp-report-only'], undefined);
});

test('allows to disable directives with a false value', async t => {
	const headers = await mock(
		t,
		{
			directives: {
				styleSrc: ['example.com'],
				scriptSrc: false
			}
		},
		UA['Firefox 23'].string
	);

	t.is(headers['content-security-policy'], 'style-src example.com');
});
