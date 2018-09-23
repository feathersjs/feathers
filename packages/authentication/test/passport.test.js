const assert = require('assert');
const passport = require('passport');
const adapter = require('../lib/passport');
const MockStrategy = require('./mock-strategy');

describe('authentication/passport', () => {
  describe('initialize', () => {
    it('adds passport.options', () => {
      const passportMock = {};
      
      adapter().initialize(passportMock);
  
      assert.equal(typeof passportMock.options, 'function');
    });

    it('using passport.options', () => {
      const passportMock = {};
      const opts = { testing: true };
      
      adapter().initialize(passportMock);
  
      passportMock.options('test', opts);

      assert.deepEqual(passportMock.options('test'), opts);
      assert.deepEqual(passportMock.options(), {
        test: opts
      });
    });
  });

  describe('authenticate', () => {
    let data, verifier, authenticator, req;

    beforeEach(() => {
      req = {
        body: {},
        headers: {},
        session: {},
        cookies: {}
      };
    });

    describe('configuration errors', () => {
      beforeEach(() => {
        passport.use(new MockStrategy({}, verifier));
      });

      it('errors when no strategy name is given', () => {
        const authenticator = adapter().authenticate(passport);

        authenticator().then(() => assert.fail('Should never get here'))
          .catch(error => {
            assert.equal(error.message, `You must provide an authentication 'strategy'`);
          });
      });

      it('errors when invalid strategy name is given', () => {
        const authenticator = adapter().authenticate(passport, 'muhkuh');

        authenticator().then(() => assert.fail('Should never get here'))
          .catch(error => {
            assert.equal(error.message, `Unknown authentication strategy 'muhkuh'`);
          });
      });

      it('errors strategy name is not allowed', () => {
        const authenticator = adapter().authenticate(passport, 'mock');

        req.body.strategy = 'something';

        authenticator(req).then(() => assert.fail('Should never get here'))
          .catch(error => {
            assert.equal(error.message, `Invalid authentication strategy 'something'`);
          });
      });
    });
    
    describe('redirect', () => {
      beforeEach(() => {
        data = {
          url: 'http://feathersjs.com',
          status: 301
        };

        verifier = cb => cb(null, null, data);
        passport.use(new MockStrategy({}, verifier));
        authenticator = adapter().authenticate(passport, 'mock');
      });

      it('sets redirect options', () => {
        return authenticator(req).then(result => {
          assert.ok(result.redirect);
          assert.equal(result.url, data.url);
          assert.equal(result.status, data.status);
        });
      });

      it('sets the default status code', () => {
        data = {
          url: 'http://feathersjs.com'
        };

        verifier = cb => cb(null, null, data);
        passport.use(new MockStrategy({}, verifier));
        authenticator = adapter().authenticate(passport, 'mock');

        return authenticator(req).then(result => {
          assert.equal(result.status, 302);
        });
      });
    });

    describe('fail', () => {
      beforeEach(() => {
        data = {
          challenge: 'Missing credentials',
          status: 400
        };

        verifier = cb => cb(null, null, data);
        passport.use(new MockStrategy({}, verifier));
        authenticator = adapter().authenticate(passport, 'mock');
      });

      it('sets fail options', () => {
        return authenticator(req).then(result => {
          assert.ok(result.fail);
          assert.equal(result.challenge, data.challenge);
          assert.equal(result.status, data.status);
        });
      });
    });

    describe('error', () => {
      it('returns the error', () => {
        const err = new Error('Authentication Failed');

        verifier = cb => cb(err, null);
        passport.use(new MockStrategy({}, verifier));
        authenticator = adapter().authenticate(passport, 'mock');

        return authenticator(req).catch(error => {
          assert.deepEqual(error, err);
        });
      });
    });

    describe('success', () => {
      let payload;
      let user;
      let organization;

      beforeEach(() => {
        payload = { platform: 'feathers' };
        user = { name: 'Bob' };
        organization = { name: 'Apple' };
        verifier = (cb) => cb(null, user, payload);
        passport.use(new MockStrategy({}, verifier));
        authenticator = adapter({ entity: 'user' }).authenticate(passport, 'mock');
      });

      it('sets success options', () => {
        return authenticator(req).then(result => {
          assert.ok(result.success);
          assert.deepEqual(result.data.user, user);
          assert.deepEqual(result.data.payload, payload);
        });
      });

      it('supports custom namespaces via passports assignProperty', () => {
        verifier = (cb) => cb(null, organization);
        passport.use(new MockStrategy({}, verifier));
        authenticator = adapter().authenticate(passport, 'mock', { assignProperty: 'organization' });

        return authenticator(req).then(result => {
          assert.deepEqual(result.data.organization, organization);
        });
      });

      it('supports custom namespaces via strategy options', () => {
        verifier = (cb) => cb(null, organization);
        passport.use(new MockStrategy({}, verifier));
        authenticator = adapter().authenticate(passport, 'mock', { entity: 'organization' });

        return authenticator(req).then(result => {
          assert.deepEqual(result.data.organization, organization);
        });
      });
    });

    describe('pass', () => {
      it('does nothing', () => {
        verifier = (cb) => cb(null, null, { pass: true });
        passport.use(new MockStrategy({}, verifier));
        authenticator = adapter().authenticate(passport, 'mock');

        return authenticator(req).then(result => {
          assert.equal(result, undefined);
        });
      });
    });
  });
});
