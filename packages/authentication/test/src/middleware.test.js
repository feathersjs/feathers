import { expect } from 'chai';
import middleware from '../../src/middleware';

const MockRequest = {
  feathers: {},
  params: {},
  body: {},
  query: {},
  headers: {},
  cookies: {}
};

const MockResponse = {
  json: function(){}
};

const MockNext = function(){};

describe('Middleware', () => {
  describe('Expose connect middleware', () => {
    it('adds the request object to req.feathers', () => {
      middleware.exposeConnectMiddleware(MockRequest, MockResponse, MockNext);
      expect(MockRequest.feathers.req).to.deep.equal(MockRequest);
    });

    it('adds the response object to req.feathers', () => {
      middleware.exposeConnectMiddleware(MockRequest, MockResponse, MockNext);
      expect(MockRequest.feathers.res).to.deep.equal(MockResponse);
    });
  });

  describe('Normalize Auth Token', () => {
    describe('with invalid options', () => {
      it('throws an error when header option is missing', () => {
        try {
          middleware.normalizeAuthToken({ cookie: 'foo' })();
        }
        catch (error) {
          expect(error.message).to.equal(`'header' must be provided to normalizeAuthToken() middleware`);
        }
      });

      it('throws an error when cookie option is missing', () => {
        try {
          middleware.normalizeAuthToken({ header: 'foo' })();
        }
        catch (error) {
          expect(error.message).to.equal(`'cookie' must be provided to normalizeAuthToken() middleware`);
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

      describe('Auth token passed via cookie', () => {
        it('grabs the token', () => {
          const req = Object.assign({}, MockRequest, {
            cookies: {
              'feathers-jwt': 'my-token'
            }
          });

          middleware.normalizeAuthToken(options)(req, MockResponse, MockNext);
          expect(req.feathers.token).to.deep.equal('my-token');
        });

        it('supports a custom cookie', () => {
          const req = Object.assign({}, MockRequest, {
            cookies: {
              'my-cookie': 'my-token'
            }
          });

          const newOptions = Object.assign({}, options, {cookie: 'my-cookie'});

          middleware.normalizeAuthToken(newOptions)(req, MockResponse, MockNext);
          expect(req.feathers.token).to.deep.equal('my-token');
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
});