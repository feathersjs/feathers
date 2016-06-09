/*jshint expr: true*/

import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import middleware from '../../src/middleware';

chai.use(sinonChai);

let MockRequest;
let MockResponse;
let MockNext;
let MockError;

describe('Middleware', () => {
  beforeEach(() => {
    MockRequest = {
      feathers: {},
      params: {},
      body: {},
      query: {},
      headers: {},
      cookies: {}
    };
    MockResponse = {
      json: sinon.spy(),
      redirect: sinon.spy(),
      data: {}
    };
    MockNext = sinon.spy();
    MockError = new Error('Mock Error');
  });

  afterEach(() => {
    MockResponse.json.reset();
    MockResponse.redirect.reset();
    MockNext.reset();
  });

  describe('exposeConnectMiddleware()', () => {
    it('adds the request object to req.feathers', () => {
      middleware.exposeConnectMiddleware(MockRequest, MockResponse, MockNext);
      expect(MockRequest.feathers.req).to.deep.equal(MockRequest);
    });

    it('adds the response object to req.feathers', () => {
      middleware.exposeConnectMiddleware(MockRequest, MockResponse, MockNext);
      expect(MockRequest.feathers.res).to.deep.equal(MockResponse);
    });
  });

  describe('normalizeAuthToken()', () => {
    describe('with invalid options', () => {
      it('throws an error when header option is missing', () => {
        try {
          middleware.normalizeAuthToken({ cookie: 'foo' })();
        }
        catch (error) {
          expect(error.message).to.equal(`'header' must be provided to normalizeAuthToken() middleware`);
        }
      });
    });

    describe('with valid options', () => {
      const options = {
        header: 'authorization',
        cookie: 'feathers-jwt'
      };

      describe('Auth token passed via header', () => {
        it('grabs the token', () => {
          const req = Object.assign({}, MockRequest, {
            headers: {
              authorization: 'Bearer my-token'
            }
          });

          middleware.normalizeAuthToken(options)(req, MockResponse, MockNext);
          expect(req.feathers.token).to.equal('my-token');
        });

        it('supports a custom header', () => {
          const req = Object.assign({}, MockRequest, {
            headers: {
              'x-authorization': 'Bearer my-token'
            }
          });

          const newOptions = Object.assign({}, options, {header: 'x-authorization'});

          middleware.normalizeAuthToken(newOptions)(req, MockResponse, MockNext);
          expect(req.feathers.token).to.equal('my-token');
        });
      });

      describe('Auth token passed via body', () => {
        it('grabs the token', () => {
          const req = Object.assign({}, MockRequest, {
            body: {
              token: 'my-token'
            }
          });

          middleware.normalizeAuthToken(options)(req, MockResponse, MockNext);
          expect(req.feathers.token).to.deep.equal('my-token');
        });

        it('deletes the token from the body', () => {
          const req = Object.assign({}, MockRequest, {
            body: {
              token: 'my-token'
            }
          });

          middleware.normalizeAuthToken(options)(req, MockResponse, MockNext);
          expect(req.body.token).to.equal(undefined);
        });
      });

      describe('Auth token passed via query', () => {
        it('grabs the token', () => {
          const req = Object.assign({}, MockRequest, {
            query: {
              token: 'my-token'
            }
          });

          middleware.normalizeAuthToken(options)(req, MockResponse, MockNext);
          expect(req.feathers.token).to.equal('my-token');
        });

        it('removes the token from the query string', () => {
          const req = Object.assign({}, MockRequest, {
            query: {
              token: 'my-token'
            }
          });

          middleware.normalizeAuthToken(options)(req, MockResponse, MockNext);
          expect(req.query.token).to.equal(undefined);
        });
      });
    });
  });

  describe('successfulLogin()', () => {
    describe('with invalid options', () => {
      it('throws an error when cookie option is missing', () => {
        try {
          middleware.successfulLogin()();
        }
        catch (error) {
          expect(error).to.not.equal(undefined);
        }
      });
    });

    describe('with valid options and not redirecting', () => {
      let options;

      beforeEach(() => {
        options = { cookie: {} };
      });

      it('calls next', () => {
        middleware.successfulLogin(options)(MockRequest, MockResponse, MockNext);
        expect(MockNext).to.have.been.calledOnce;
      });

      describe('when it came from an ajax request', () => {
        it('calls next', () => {
          MockRequest.xhr = true;
          options.successRedirect = true;
          
          middleware.successfulLogin(options)(MockRequest, MockResponse, MockNext);
          expect(MockNext).to.have.been.calledOnce;
        });
      });

      describe('when content type is JSON', () => {
        it('calls next', () => {
          MockRequest.is = sinon.stub().returns(true);
          options.successRedirect = true;
          
          middleware.successfulLogin(options)(MockRequest, MockResponse, MockNext);
          expect(MockNext).to.have.been.calledOnce;
        });
      });

      describe('when client does not accept HTML', () => {
        it('calls next', () => {
          MockRequest.is = sinon.stub().returns(false);
          MockRequest.accepts = sinon.stub().returns(false);
          options.successRedirect = true;
          
          middleware.successfulLogin(options)(MockRequest, MockResponse, MockNext);
          expect(MockNext).to.have.been.calledOnce;
        });
      });
    });

    describe('with valid options and redirecting', () => {
      let options;

      beforeEach(() => {
        options = {
          cookie: false,
          successRedirect: '/auth/success'
        };
        
        MockRequest.xhr = false;
        MockRequest.is = sinon.stub().returns(false);
        MockRequest.accepts = sinon.stub().returns(true);
        MockResponse.clearCookie = sinon.spy();
      });

      it('redirects', () => {
        middleware.successfulLogin(options)(MockRequest, MockResponse, MockNext);
        expect(MockResponse.redirect).to.have.been.calledWith('/auth/success');
      });

      describe('when cookie enabled', () => {
        beforeEach(() => {
          options.cookie = { name: 'feathers-jwt' };
          MockResponse.cookie = sinon.spy();
        });

        it('clears cookies', () => {
          options.cookie.expires = new Date();
          middleware.successfulLogin(options)(MockRequest, MockResponse, MockNext);
          expect(MockResponse.clearCookie).to.have.been.calledWith('feathers-jwt');
        });

        it('throws a warning if not using HTTPS in production', () => {
          let MockConsoleWarn = sinon.stub(console, 'warn');
          process.env.NODE_ENV = 'production';
          MockRequest.secure = false;
          options.cookie = { 
            name: 'feathers-jwt',
            secure:true
          };
          
          MockResponse.data.token = 'token';

          middleware.successfulLogin(options)(MockRequest, MockResponse, MockNext);
          expect(MockResponse.cookie).to.have.been.calledWith('feathers-jwt', 'token');
          expect(console.warn).to.have.been
            .calledWith('WARN: Request isn\'t served through HTTPS: JWT in the cookie is exposed.');
          
          process.env.NODE_ENV = undefined;
          MockConsoleWarn.reset();
        });

        it('throws an error if expires is not a date', () => {
          options.cookie.expires = 'not a date';

          try {
            middleware.successfulLogin(options)(MockRequest, MockResponse, MockNext);  
          }
          catch(error) {
            expect(error).to.not.equal(undefined);
          }
        });

        it('sets the cookie', () => {
          MockResponse.data.token = 'token';

          middleware.successfulLogin(options)(MockRequest, MockResponse, MockNext);
          expect(MockResponse.cookie).to.have.been.calledWith('feathers-jwt', 'token');
        });

        it('supports custom cookie expiration', () => {
          const expiry = new Date('Jan 1, 2000');
          options.cookie.expires = expiry;
          MockResponse.data.token = 'token';

          const expected = Object.assign({}, options.cookie, {
            path: '/auth/success',
            expires: expiry
          });

          middleware.successfulLogin(options)(MockRequest, MockResponse, MockNext);
          expect(MockResponse.cookie).to.have.been.calledWith('feathers-jwt', 'token', expected);
        });
      });
    });
  });

  describe('failedLogin()', () => {
    describe('with invalid options', () => {
      it('throws an error when cookie option is missing', () => {
        try {
          middleware.failedLogin()();
        }
        catch (error) {
          expect(error).to.not.equal(undefined);
        }
      });
    });

    describe('with valid options and not redirecting', () => {
      let options;

      beforeEach(() => {
        options = { cookie: {} };
      });

      it('calls next', () => {
        middleware.failedLogin(options)(MockError, MockRequest, MockResponse, MockNext);
        expect(MockNext).to.have.been.calledOnce;
      });

      describe('when it came from an ajax request', () => {
        it('calls next', () => {
          MockRequest.xhr = true;
          options.successRedirect = true;
          
          middleware.failedLogin(options)(MockError, MockRequest, MockResponse, MockNext);
          expect(MockNext).to.have.been.calledOnce;
        });
      });

      describe('when content type is JSON', () => {
        it('calls next', () => {
          MockRequest.is = sinon.stub().returns(true);
          options.successRedirect = true;
          
          middleware.failedLogin(options)(MockError, MockRequest, MockResponse, MockNext);
          expect(MockNext).to.have.been.calledOnce;
        });
      });

      describe('when client does not accept HTML', () => {
        it('calls next', () => {
          MockRequest.is = sinon.stub().returns(false);
          MockRequest.accepts = sinon.stub().returns(false);
          options.successRedirect = true;
          
          middleware.failedLogin(options)(MockError, MockRequest, MockResponse, MockNext);
          expect(MockNext).to.have.been.calledOnce;
        });
      });
    });

    describe('with valid options and redirecting', () => {
      let options;

      beforeEach(() => {
        options = {
          cookie: false,
          failureRedirect: '/auth/failure'
        };
        
        MockRequest.xhr = false;
        MockRequest.is = sinon.stub().returns(false);
        MockRequest.accepts = sinon.stub().returns(true);
        MockResponse.clearCookie = sinon.spy();
      });

      describe('when cookie is enabled', () => {
        beforeEach(() => {
          options.cookie = { name: 'feathers-jwt' };
        });

        it('clears cookies', () => {
          middleware.failedLogin(options)(MockError, MockRequest, MockResponse, MockNext);
          expect(MockResponse.clearCookie).to.have.been.calledWith('feathers-jwt');
        });
      });

      it('redirects', () => {
        middleware.failedLogin(options)(MockError, MockRequest, MockResponse, MockNext);
        expect(MockResponse.redirect).to.have.been.calledWith('/auth/failure');
      });
    });
  });
});
