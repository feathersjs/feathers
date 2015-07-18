# assert.js

assert.js is a port of the Node.js standard assertion library for the browser.
The original code and tests are from Node.js, and have been modified to be browser compatible.

For example, you can use it with [Mocha](http://visionmedia.github.com/mocha/) to perform tests
on the **both sides** (server-side and client-side). Mocha does not supply it's own assertion library.

## run the same tests on both the client-side and server-side

You can use the standard assert module when running mocha on Node.js.

The same tests will run in the browser if you use this library.

## how to use

```html
<script src="assert.js"></script>
<script src="path/to/testing-framework.js"></script>
<script src="path/to/your/test.js"></script>
```

## running test of this library

### browser
open ```test/index.html``` in your browser,
and see the console.

### node.js

```shell
> node test/test-assert.js
All OK
```

## license

MIT (same as Node.js)