# fastify-csp

[![Code style][lint-img]][lint-url]
[![Dependency Status][dep-img]][dep-url]
[![Dev Dependency Status][dev-dep-img]][dev-dep-url]
[![NPM version][npm-ver-img]][npm-url]
[![NPM downloads][npm-dl-img]][npm-url]
[![NPM license][npm-lc-img]][npm-url]

Fastify plugin to set Content-Security-Policy header

## Why?

You may know [csp](https://github.com/helmetjs/csp) as a [csp middleware](https://helmetjs.github.io/docs/csp/) used in [helmet](https://github.com/helmetjs/helmet). And you could use it as a middleware in fastify also. So why i made this plugin?

Benchmark with no plugin:

```txt
Running 20s test @ http://127.0.0.1:10290/pudge/rest/v0/benchmark
1000 connections

Stat         Avg     Stdev   Max
Latency (ms) 32.37   8.9     1139.09
Req/Sec      30444   1051.31 31048
Bytes/Sec    4.53 MB 170 kB  4.63 MB

609k requests in 20s, 90.7 MB read
```

Benchmark with csp as middleware:

```txt
Running 20s test @ http://127.0.0.1:10290/pudge/rest/v0/benchmark
1000 connections

Stat         Avg     Stdev  Max
Latency (ms) 40.83   186.86 9994.55
Req/Sec      20433.8 1322.2 21069
Bytes/Sec    5.57 MB 366 kB 5.79 MB

409k requests in 20s, 112 MB read
```

Benchmark with this plugin: (I am not satisfied with this result and going to optimize it)

```txt
Running 20s test @ http://127.0.0.1:10290/pudge/rest/v0/benchmark
1000 connections

Stat         Avg     Stdev  Max
Latency (ms) 41      161.69 9984.06
Req/Sec      22980.8 568.41 23433
Bytes/Sec    4.48 MB 162 kB 4.55 MB

460k requests in 20s, 89.2 MB read
```

So that's the reason and wish you like it. :)

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
    defaultSrc: ["self"]
  }
  // e.t.c
});

app.listen(3000, err => {
  if (err) throw err;
});
```

## Options

This plugin has the same options as the middleware in helmet. To learn more, you may check out [the spec](https://www.w3.org/TR/CSP/) or [reference guide](https://content-security-policy.com/).

### directives {object}

__This option is required.__

Specify directives with at least one directive field. Supported directives:

* `base-uri` or `baseUri`
* `block-all-mixed-content` or `blockAllMixedContent`
* `child-src` or `childSrc`
* `connect-src` or `connectSrc`
* `default-src` or `defaultSrc`
* `font-src` or `fontSrc`
* `form-action` or `formAction`
* `frame-ancestors` or `frameAncestors`
* `frame-src` or `frameSrc`
* `img-src` or `imgSrc`
* `manifest-src` or `manifestSrc`
* `media-src` or `mediaSrc`
* `object-src` or `objectSrc`
* `plugin-types` or `pluginTypes`
* `prefetch-src` or `prefetchSrc`
* `report-to` or `reportTo`
* `report-uri` or `reportUri`
* `require-sri-for` or `requireSriFor`
* `sandbox` or `sandbox`
* `script-src` or `scriptSrc`
* `style-src` or `styleSrc`
* `upgrade-insecure-requests` or `upgradeInsecureRequests`
* `worker-src` or `workerSrc`

### loose {boolean}

This module will detect common mistakes in your directives and throw errors if it finds any.
To disable this, enable "loose mode".

### reportOnly {boolean}

Set to `true` if you only want browsers to report errors, not block them.
You may also set this to a `function(request, reply)` in order to decide dynamically
whether to use reportOnly mode, e.g., to allow for a dynamic kill switch.

### setAllHeaders {boolean}

Set to `true` if you want to blindly set all headers: `Content-Security-Policy`, `X-WebKit-CSP`, and `X-Content-Security-Policy`.

### disableAndroid {boolean}

Set to `true` if you want to disable CSP on Android where it can be buggy.

### browserSniff {boolean}

Set to `false` if you want to completely disable any user-agent sniffing.
This may make the headers less compatible but it will be much faster.
This defaults to `true`.

## Changelog

* 0.0.1: Init version

## Todo

* Optimize performance
* Add test case
* Add ci
* Add benchmark scripts

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
