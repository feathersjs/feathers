/*jshint expr: true, unused: false*/

if(!global._babelPolyfill) { require('babel-polyfill'); }

import feathers from 'feathers';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import request from 'request';
import fs from 'fs';
import { join } from 'path';
import { errors } from '../src';
import handler from '../src/error-handler';

chai.use(sinonChai);

const content = '<html><head></head><body>Error</body></html>';

let htmlHandler = sinon.spy(function(error, req, res, next) {
  res.send(content);
});

const jsonHandler = sinon.spy(function(error, req, res, next) {
  res.json(error);
});

describe('error-handler', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../lib/error-handler')).to.equal('function');
  });

  it('can be required at the root', () => {
    expect(typeof require('../handler')).to.equal('function');
  });

  it('is import compatible', () => {
    expect(typeof handler).to.equal('function');
  });

  describe('supports custom handlers', function() {
    before(function() {
      this.app = feathers()
        .get('/error', function(req, res, next) {
          next(new Error('Something went wrong'));
        })
        .use(handler({
          html: htmlHandler,
          json: jsonHandler
        }));
      
      this.server = this.app.listen(5050);
    });
    
    after(function(done) {
      this.server.close(done);
    });

    describe('HTML handler', () => {
      const options = {
        url: 'http://localhost:5050/error',
        headers: {
          'Content-Type': 'text/html',
          'Accept': 'text/html'
        }
      };

      it('is called', done => {
        request(options, (error, res, body) => {
          expect(htmlHandler).to.be.called;
          done();
        });
      });

      it('can send a custom response', done => {
        request(options, (error, res, body) => {
          expect(body).to.equal(content);
          done();
        });
      });
    });

    describe('JSON handler', () => {
      const options = {
        url: 'http://localhost:5050/error',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      it('is called', done => {
        request(options, (error, res, body) => {
          expect(jsonHandler).to.be.called;
          done();
        });
      });

      it('can send a custom response', done => {
        const expected = JSON.stringify({
          name: 'GeneralError',
          message: 'Something went wrong',
          code: 500,
          className: 'general-error',
          data: {},
          errors: {}
        });
        request(options, (error, res, body) => {
          expect(body).to.deep.equal(expected);
          done();
        });
      });
    });
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
        .get('/bad-request', function(req, res, next) {
          next(new errors.BadRequest({
            message: 'Invalid Password',
            errors: [{
              path: 'password',
              value: null,
              message: `'password' cannot be 'null'`
            }]
          }));
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
          expect(res.statusCode).to.equal(500);
          expect(body).to.deep.equal({
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
        expect(handler).to.equal('function');  
      });
    });

    describe('text/html format', () => {
      it('serves a 404.html', done => {
        fs.readFile(join(__dirname, '..', 'src', 'public', '404.html'), function(err, html) {
          request({
            url: 'http://localhost:5050/path/to/nowhere',
            headers: {
              'Content-Type': 'text/html',
              'Accept': 'text/html'
            }
          }, (error, res, body) => {
            expect(res.statusCode).to.equal(404);
            expect(html.toString()).to.equal(body);
            done();
          });
        });
      });

      it('serves a 500.html', done => {
        fs.readFile(join(__dirname, '..', 'src', 'public', 'default.html'), function(err, html) {
          request({
            url: 'http://localhost:5050/error',
            headers: {
              'Content-Type': 'text/html',
              'Accept': 'text/html'
            }
          }, (error, res, body) => {
            expect(res.statusCode).to.equal(500);
            expect(html.toString()).to.equal(body);
            done();
          });
        });
      });

      it('returns html when Content-Type header is set', done => {
        fs.readFile(join(__dirname, '..', 'src', 'public', '404.html'), function(err, html) {
          request({
            url: 'http://localhost:5050/path/to/nowhere',
            headers: {
              'Content-Type': 'text/html'
            }
          }, (error, res, body) => {
            expect(res.statusCode).to.equal(404);
            expect(html.toString()).to.equal(body);
            done();
          });
        });
      });

      it('returns html when Accept header is set', done => {
        fs.readFile(join(__dirname, '..', 'src', 'public', '404.html'), function(err, html) {
          request({
            url: 'http://localhost:5050/path/to/nowhere',
            headers: {
              'Accept': 'text/html'
            }
          }, (error, res, body) => {
            expect(res.statusCode).to.equal(404);
            expect(html.toString()).to.equal(body);
            done();
          });
        });
      });
    });

    describe('application/json format', () => {
      it('500', done => {
        request({
          url: 'http://localhost:5050/error',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          json: true
        }, (error, res, body) => {
          expect(res.statusCode).to.equal(500);
          expect(body).to.deep.equal({
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

      it('404', done => {
        request({
          url: 'http://localhost:5050/path/to/nowhere',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          json: true
        }, (error, res, body) => {
          expect(res.statusCode).to.equal(404);
          expect(body).to.deep.equal({ name: 'NotFound',
            message: 'File not found',
            code: 404,
            className: 'not-found',
            errors: {}
          });
          done();
        });
      });

      it('400', done => {
        request({
          url: 'http://localhost:5050/bad-request',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          json: true
        }, (error, res, body) => {
          expect(res.statusCode).to.equal(400);
          expect(body).to.deep.equal({ name: 'BadRequest',
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
          done();
        });
      });

      it('returns JSON when only Content-Type header is set', done => {
        request({
          url: 'http://localhost:5050/bad-request',
          headers: {
            'Content-Type': 'application/json'
          },
          json: true
        }, (error, res, body) => {
          expect(res.statusCode).to.equal(400);
          expect(body).to.deep.equal({ name: 'BadRequest',
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
          done();
        });
      });

      it('returns JSON when only Accept header is set', done => {
        request({
          url: 'http://localhost:5050/bad-request',
          headers: {
            'Accept': 'application/json'
          },
          json: true
        }, (error, res, body) => {
          expect(res.statusCode).to.equal(400);
          expect(body).to.deep.equal({ name: 'BadRequest',
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
          done();
        });
      });
    });

    it('returns JSON by default', done => {
      request('http://localhost:5050/bad-request', (error, res, body) => {
        const expected = JSON.stringify({
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

        expect(res.statusCode).to.equal(400);
        expect(body).to.deep.equal(expected);
        done();
      });
    });
  });
});
