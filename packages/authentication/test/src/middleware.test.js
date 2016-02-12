import assert from 'assert';
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
      assert.deepEqual(MockRequest.feathers.req, MockRequest);
    });

    it('adds the response object to req.feathers', () => {
      middleware.exposeConnectMiddleware(MockRequest, MockResponse, MockNext);
      assert.deepEqual(MockRequest.feathers.res, MockResponse);
    });
  });

  describe('Normalize Auth Token', () => {
    describe('Auth token passed via header', () => {
      it('grabs the token', () => {
        const req = Object.assign({}, MockRequest, {
          headers: {
            authorization: 'Bearer my-token'
          }
        });

        middleware.normalizeAuthToken()(req, MockResponse, MockNext);
        assert.deepEqual(req.feathers.token, 'my-token');
      });

      it('supports a custom header', () => {
        const req = Object.assign({}, MockRequest, {
          headers: {
            'x-authorization': 'Bearer my-token'
          }
        });

        middleware.normalizeAuthToken({header: 'x-authorization'})(req, MockResponse, MockNext);
        assert.deepEqual(req.feathers.token, 'my-token');
      });
    });

    describe('Auth token passed via cookie', () => {
      it('grabs the token', () => {
        const req = Object.assign({}, MockRequest, {
          cookies: {
            'feathers-jwt': 'my-token'
          }
        });

        middleware.normalizeAuthToken()(req, MockResponse, MockNext);
        assert.deepEqual(req.feathers.token, 'my-token');
      });
    });

    describe('Auth token passed via body', () => {
      it('grabs the token', () => {
        const req = Object.assign({}, MockRequest, {
          body: {
            token: 'my-token'
          }
        });

        middleware.normalizeAuthToken()(req, MockResponse, MockNext);
        assert.deepEqual(req.feathers.token, 'my-token');
      });

      it('deletes the token from the body', () => {
        const req = Object.assign({}, MockRequest, {
          body: {
            token: 'my-token'
          }
        });

        middleware.normalizeAuthToken()(req, MockResponse, MockNext);
        assert.equal(req.body.token, undefined);
      });
    });

    describe('Auth token passed via query', () => {
      it('grabs the token', () => {
        const req = Object.assign({}, MockRequest, {
          query: {
            token: 'my-token'
          }
        });

        middleware.normalizeAuthToken()(req, MockResponse, MockNext);
        assert.deepEqual(req.feathers.token, 'my-token');
      });

      it('removes the token from the query string', () => {
        const req = Object.assign({}, MockRequest, {
          query: {
            token: 'my-token'
          }
        });

        middleware.normalizeAuthToken()(req, MockResponse, MockNext);
        assert.equal(req.query.token, undefined);
      });
    });
  });
});