const fastify = require('fastify');
const self = require('../src/index');
const { host, port, path, rsp } = require('./config');

fastify()
	.register(self, {
		directives: {
			defaultSrc: ["'self'"]
		}
	})
	.get(path, (request, reply) => {
		reply.send(rsp);
	})
	.listen(port, host);
