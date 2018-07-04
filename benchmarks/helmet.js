const fastify = require('fastify');
const helmet = require('helmet-csp');
const { host, port, path, rsp } = require('./config');

fastify()
	.use(helmet({
		directives: {
			defaultSrc: ["'self'"]
		}
	}))
	.get(path, (request, reply) => {
		reply.send(rsp);
	})
	.listen(port, host);
