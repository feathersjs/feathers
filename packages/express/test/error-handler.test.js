/* tsline:disable:handle-callback-err */
/* tslint:disable:no-unused-expression */
const { strict: assert } = require('assert');
const express = require('express');
const errors = require('@feathersjs/errors');
const axios = require('axios');
const fs = require('fs');
const { join } = require('path');

const handler = require('../lib/error-handler');

const content = '<html><head></head><body>Error</body></html>';

let htmlHandler = function (error, req, res, next) {
  res.send(content);
};

const jsonHandler = function (error, req, res, next) {
  res.json(error);
};

describe('error-handler', () => {
  it('is CommonJS compatible', () => {
    assert.equal(typeof require('../lib/error-handler'), 'function');
  });

  it('is import compatible', () => {
    assert.equal(typeof handler, 'function');
  });

  describe('supports catch-all custom handlers', function () {
    let currentError;

    before(function () {
      this.app = express().get('/error', function (req, res, next) {
        next(new Error('Something went wrong'));
      }).use(handler({
        html: htmlHandler,
        json: jsonHandler,
        logger: {
          error (e) {
            currentError = e;
          }
        }
      }));

      this.server = this.app.listen(5050);
    });

    after(function (done) {
      this.server.close(done);
    });

    describe('JSON handler', () => {
      const options = {
        url: 'http://localhost:5050/error',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      it('can send a custom response', async () => {
        try {
          await axios(options);
          assert.fail('Should never get here');
        } catch (error) {
          assert.deepEqual(error.response.data, {
            name: 'GeneralError',
            message: 'Something went wrong',
            code: 500,
            className: 'general-error',
            data: {},
            errors: {}
          });
        }
      });
    });
  });

  describe('supports error-code specific custom handlers', () => {
    describe('HTML handler', () => {
      const req = {
        headers: { 'content-type': 'text/html' }
      };
      const makeRes = (errCode, props) => {
        return Object.assign({
          set () {},
          status (code) {
            assert.equal(code, errCode);
          }
        }, props);
      };

      it('if the value is a string, calls res.sendFile', done => {
        const err = new errors.NotAuthenticated();
        const middleware = handler({
          logger: null,
          html: { 401: 'path/to/401.html' }
        });
        const res = makeRes(401, {
          sendFile (f) {
            assert.equal(f, 'path/to/401.html');
            done();
          }
        });
        middleware(err, req, res);
      });

      it('if the value is a function, calls as middleware ', done => {
        const err = new errors.PaymentError();
        const res = makeRes(402);
        const middleware = handler({
          logger: null,
          html: { 402: (_err, _req, _res) => {
            assert.equal(_err, err);
            assert.equal(_req, req);
            assert.equal(_res, res);
            done();
          } }
        });
        middleware(err, req, res);
      });

      it('falls back to default if error code config is available', done => {
        const err = new errors.NotAcceptable();
        const res = makeRes(406);
        const middleware = handler({
          logger: null,
          html: { default: (_err, _req, _res) => {
            assert.equal(_err, err);
            assert.equal(_req, req);
            assert.equal(_res, res);
            done();
          } }
        });
        middleware(err, req, res);
      });
    });

    describe('JSON handler', () => {
      const req = {
        headers: { 'content-type': 'application/json' }
      };
      const makeRes = (errCode, props) => {
        return Object.assign({
          set () {},
          status (code) {
            assert.equal(code, errCode);
          }
        }, props);
      };

      it('calls res.json by default', done => {
        const err = new errors.NotAuthenticated();
        const middleware = handler({
          logger: null,
          json: {}
        });
        const res = makeRes(401, {
          json (obj) {
            assert.deepEqual(obj, err.toJSON());
            done();
          }
        });
        middleware(err, req, res);
      });

      it('if the value is a function, calls as middleware ', done => {
        const err = new errors.PaymentError();
        const res = makeRes(402);
        const middleware = handler({
          logger: null,
          json: { 402: (_err, _req, _res) => {
            assert.equal(_err, err);
            assert.equal(_req, req);
            assert.equal(_res, res);
            done();
          } }
        });
        middleware(err, req, res);
      });

      it('falls back to default if error code config is available', done => {
        const err = new errors.NotAcceptable();
        const res = makeRes(406);
        const middleware = handler({
          logger: null,
          json: { default: (_err, _req, _res) => {
            assert.equal(_err, err);
            assert.equal(_req, req);
            assert.equal(_res, res);
            done();
          } }
        });
        middleware(err, req, res);
      });
    });
  });

  describe('use as app error handler', function () {
    before(function () {
      this.app = express()
        .get('/error', function (req, res, next) {
          next(new Error('Something went wrong'));
        })
        .get('/string-error', function (req, res, next) {
          const e = new Error('Something was not found');
          e.code = '404';

          next(e);
        })
        .get('/bad-request', function (req, res, next) {
          next(new errors.BadRequest({
            message: 'Invalid Password',
            errors: [{
              path: 'password',
              value: null,
              message: `'password' cannot be 'null'`
            }]
          }));
        })
        .use(function (req, res, next) {
          next(new errors.NotFound('File not found'));
        })
        .use(handler({
          logger: null
        }));

      this.server = this.app.listen(5050);
    });

    after(function (done) {
      this.server.close(done);
    });

    describe('converts an non-feathers error', () => {
      it('is an instance of GeneralError', async () => {
        try {
          await axios({
            url: 'http://localhost:5050/error',
            json: true
          });
          assert.fail('Should never get here');
        } catch (error) {
          assert.equal(error.response.status, 500);
          assert.deepEqual(error.response.data, {
            name: 'GeneralError',
            message: 'Something went wrong',
            code: 500,
            className: 'general-error',
            data: {},
            errors: {}
          });
        }
      });
    });

    describe('text/html format', () => {
      it('serves a 404.html', done => {
        fs.readFile(join(__dirname, '..', 'lib', 'public', '404.html'), async function (err, html) {
          try {
            await axios({
              url: 'http://localhost:5050/path/to/nowhere',
              headers: {
                'Content-Type': 'text/html',
                'Accept': 'text/html'
              }
            });
            assert.fail('Should never get here');
          } catch(error) {
            assert.equal(error.response.status, 404);
            assert.equal(error.response.data, html.toString());
            done();
          }
        });
      });

      it('serves a 500.html', done => {
        fs.readFile(join(__dirname, '..', 'lib', 'public', 'default.html'), async function (err, html) {
          try {
            await axios({
              url: 'http://localhost:5050/error',
              headers: {
                'Content-Type': 'text/html',
                'Accept': 'text/html'
              }
            });
            assert.fail('Should never get here');
          } catch(error) {
            assert.equal(error.response.status, 500);
            assert.equal(error.response.data, html.toString());
            done();
          }
        });
      });
    });

    describe('application/json format', () => {
      it('500', async () => {
        try {
          await axios({
            url: 'http://localhost:5050/error',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          assert.fail('Should never get here');
        } catch (error) {
          assert.equal(error.response.status, 500);
          assert.deepEqual(error.response.data, {
            name: 'GeneralError',
            message: 'Something went wrong',
            code: 500,
            className: 'general-error',
            data: {},
            errors: {}
          });
        }
      });

      it('404', async () => {
        try {
          await axios({
            url: 'http://localhost:5050/path/to/nowhere',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          assert.fail('Should never get here');
        } catch (error) {
          assert.equal(error.response.status, 404);
          assert.deepEqual(error.response.data, { name: 'NotFound',
            message: 'File not found',
            code: 404,
            className: 'not-found',
            errors: {}
          });
        }
      });

      it('400', async () => {
        try {
          await axios({
            url: 'http://localhost:5050/bad-request',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          assert.fail('Should never get here');
        } catch (error) {
          assert.equal(error.response.status, 400);
          assert.deepEqual(error.response.data, { name: 'BadRequest',
            message: 'Invalid Password',
            code: 400,
            className: 'bad-request',
            data: {
              message: 'Invalid Password'
            },
            errors: [{
              path: 'password',
              value: null,
              message: `'password' cannot be 'null'`
            }]
          });
        }
      });
    });

    it('returns JSON by default', async () => {
      try {
        await axios('http://localhost:5050/bad-request');
        assert.fail('Should never get here');
      } catch (error) {
        assert.equal(error.response.status, 400);
        assert.deepEqual(error.response.data, {
          name: 'BadRequest',
          message: 'Invalid Password',
          code: 400,
          className: 'bad-request',
          data: {
            message: 'Invalid Password'
          },
          errors: [{
            path: 'password',
            value: null,
            message: `'password' cannot be 'null'`
          }]
        });
      }
    });
  });
});
