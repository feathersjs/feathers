---
outline: deep
---

# Application tests

The `app.test` file starts the server and then tests that it shows the index page and that 404 (Not Found) JSON errors are being returned. It uses the [Axios HTTP](https://axios-http.com/) library to make the calls.

This file can e.g. be used to test application [setup](../../api/application.md#setupserver) and [teardown](../../api/application.md#teardownserver).

All tests are using [MochaJS](https://mochajs.org/) but will be moving to the [NodeJS test runner](https://nodejs.org/api/test.html) in the future.
