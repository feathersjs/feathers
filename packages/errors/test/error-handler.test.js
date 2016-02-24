if(!global._babelPolyfill) { require('babel-polyfill'); }

import feathers from 'feathers';
import assert from 'assert';
import request from 'request';
import fs from 'fs';
import { join } from 'path';
import { errors } from '../src';
import handler from '../src/error-handler';

describe('feathers-errors', () => {
  it('is CommonJS compatible', () => {
    assert.equal(typeof require('../lib/error-handler'), 'function');
  });

  it('can be required at the root', () => {
    assert.equal(typeof require('../handler'), 'function');
  });

  it('is import compatible', () => {
    assert.equal(typeof handler, 'function');
  });
  
  describe('use as app error handler', function() {
    before(function() {
      this.app = feathers()
        .get('/error', function(req, res, next) {
          next(new Error('Something went wrong'));
        })
        .get('/string-error', function(req, res, next) {
          const e = new Error('Something was not found');
          e.code = '404';
          
          next(e);
        })
        .use(function(req, res, next) {
          next(new errors.NotFound('File not found'));
        })
        .use(handler());
      
      this.server = this.app.listen(5050);
    });
    
    after(function(done) {
      this.server.close(done);
    });
    
    describe('converts an non-feathers error', () => {
      it('is an instance of GeneralError', done => {
        request({
          url: 'http://localhost:5050/error',
          json: true
        }, (error, res, body) => {
          assert.equal(res.statusCode, 500);
          assert.deepEqual(body, {
            name: 'GeneralError',
            message: 'Something went wrong',
            code: 500,
            className: 'general-error',
            data: {},
            errors: {}
          });
          done();
        });
      });

      it.skip('still has a stack trace', () => {
        assert.equal(handler, 'function');  
      });
    });

    describe('text/html format', () => {
      it('serves a 404.html', done => {
        fs.readFile(join(__dirname, '..', 'src', 'public', '404.html'), function(err, html) {
          request('http://localhost:5050/path/to/nowhere', (error, res, body) => {
            assert.equal(res.statusCode, 404);
            assert.equal(html.toString(), body);
            done();
          });
        });
      });

      it('serves a 500.html', done => {
        fs.readFile(join(__dirname, '..', 'src', 'public', 'default.html'), function(err, html) {
          request('http://localhost:5050/error', (error, res, body) => {
            assert.equal(res.statusCode, 500);
            assert.equal(html.toString(), body);
            done();
          });
        });
      });
    });

    describe('application/json format', () => {
      it('404', done => {
        request({
          url: 'http://localhost:5050/error',
          json: true
        }, (error, res, body) => {
          assert.equal(res.statusCode, 500);
          assert.deepEqual(body, {
            name: 'GeneralError',
            message: 'Something went wrong',
            code: 500,
            className: 'general-error',
            data: {},
            errors: {}
          });
          done();
        });
      });

      it('500', done => {
        request({
          url: 'http://localhost:5050/path/to/nowhere',
          json: true
        }, (error, res, body) => {
          assert.equal(res.statusCode, 404);
          assert.deepEqual(body, { name: 'NotFound',
            message: 'File not found',
            code: 404,
            className: 'not-found',
            errors: {}
          });
          done();
        });
      });
    });
  });
});
