# fastify-csp

[![Build Status][ci-img]][ci-url]
[![Code coverage][cov-img]][cov-url]
[![Code style][lint-img]][lint-url]
[![Dependency Status][dep-img]][dep-url]
[![Dev Dependency Status][dev-dep-img]][dev-dep-url]
[![NPM version][npm-ver-img]][npm-url]
[![NPM downloads][npm-dl-img]][npm-url]
[![NPM license][npm-lc-img]][npm-url]

Fastify plugin to set Content-Security-Policy header.

## Why?

You may know [csp](https://github.com/helmetjs/csp) as a [csp middleware](https://helmetjs.github.io/docs/csp/) used in [helmet](https://github.com/helmetjs/helmet). And you could use it as a middleware in fastify also. So why i made this plugin?

You may find the reason in [benchmark result](./benchmarks/benchmark.txt) and wish you like it. :)

## Difference

This plugin has passed all [csp](https://github.com/helmetjs/csp) test cases.
But there are some differences to [csp](https://github.com/helmetjs/csp):

- Don't support kebab case directive name. All directive name shoud be in camel case.
- Use [lru cache](https://github.com/isaacs/node-lru-cache) for static policy generation which won't effect dynamic situation.

## Install

Via npm:

```shell
npm i fastify-csp
```

Via yarn:

```shell
yarn add fastify-csp
```

## Usage

```js
const fastify = require('fastify');
const fastifyCsp = require('fastify-csp');

const app = fastify();
app.register(fastifyCsp, {
  directives: {
    defaultSrc: ["'self'"]
  }
  // e.t.c
});

app.listen(3000, err => {
  if (err) throw err;
});
```

## Options

This plugin has the same options as the middleware in helmet.
To learn more, you may check out [the spec](https://www.w3.org/TR/CSP/) or [reference guide](https://content-security-policy.com/).

### directives {object}

__This option is required.__

__All directive name shoud be in camel case.__

Specify directives with at least one directive field. Supported directives:

* `baseUri` (as `base-url`)
* `blockAllMixedContent` (as `block-all-mixed-content`)
* `childSrc` (as `child-src`)
* `connectSrc` (as `connect-src`)
* `defaultSrc` (as `default-src`)
* `fontSrc` (as `font-src`)
* `formAction` (as `form-action`)
* `frameAncestors` (as `frame-ancestors`)
* `frameSrc` (as `frame-src`)
* `imgSrc` (as `img-src`)
* `manifestSrc` (as `manifest-src`)
* `mediaSrc` (as `media-src`)
* `objectSrc` (as `object-src`)
* `pluginTypes` (as `plugin-types`)
* `prefetchSrc` (as `prefetch-src`)
* `reportTo` (as `report-to`)
* `reportUri` (as `report-uri`)
* `requireSriFor` (as `require-sri-for`)
* `sandbox` (as `sandbox`)
* `scriptSrc` (as `script-src`)
* `styleSrc` (as `style-src`)
* `upgradeInsecureRequests` (as `upgrade-insecure-requests`)
* `workerSrc` (as `worker-src`)

### loose {boolean}

Default is `false`.

This module will detect common mistakes in your directives and throw errors if finds any.
To disable this, set `true` to `loose` option.

### reportOnly {boolean|function}

Default is `false`.

Set to `true` if you only want browsers to report errors, not block them.
You may also set this to a `function(request, reply)` in order to decide dynamically
whether to use reportOnly mode, e.g., to allow for a dynamic kill switch.

### setAllHeaders {boolean}

Default is `false`.

Set to `true` if you want to blindly set all headers: `Content-Security-Policy`, `X-WebKit-CSP`, and `X-Content-Security-Policy`.

### disableAndroid {boolean}

Default is `false`.

Set to `true` if you want to disable CSP on Android where it can be buggy.

### browserSniff {boolean}

Default is `true`.

Set to `false` if you want to completely disable any user-agent sniffing.
This may make the headers less compatible but it will be much faster.

## Changelog

- 0.1.0
  - Update performance
  - Add benchmarks
  - Add test case
  - Add code coverage
- 0.0.1:
  - Init version

[ci-img]: https://img.shields.io/travis/poppinlp/fastify-expect-ct.svg?style=flat-square
[ci-url]: https://travis-ci.org/poppinlp/fastify-expect-ct
[cov-img]: https://img.shields.io/coveralls/poppinlp/fastify-expect-ct.svg?style=flat-square
[cov-url]: https://coveralls.io/github/poppinlp/fastify-expect-ct?branch=master
[lint-img]: https://img.shields.io/badge/code%20style-handsome-brightgreen.svg?style=flat-square
[lint-url]: https://github.com/poppinlp/eslint-config-handsome
[dep-img]: https://img.shields.io/david/poppinlp/fastify-csp.svg?style=flat-square
[dep-url]: https://david-dm.org/poppinlp/fastify-csp
[dev-dep-img]: https://img.shields.io/david/dev/poppinlp/fastify-csp.svg?style=flat-square
[dev-dep-url]: https://david-dm.org/poppinlp/fastify-csp#info=devDependencies
[npm-ver-img]: https://img.shields.io/npm/v/fastify-csp.svg?style=flat-square
[npm-dl-img]: https://img.shields.io/npm/dm/fastify-csp.svg?style=flat-square
[npm-lc-img]: https://img.shields.io/npm/l/fastify-csp.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/fastify-csp
