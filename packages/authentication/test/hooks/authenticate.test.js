/* eslint-disable no-unused-expressions */
const passport = require('passport');
const assert = require('assert');

const { authenticate } = require('../../lib/hooks');
const adapter = require('../../lib/passport');

const MockStrategy = require('../mock-strategy');

describe('authentication/hooks/authenticate', () => {
  let hook;

  beforeEach(() => {
    passport.use(new MockStrategy({}, () => {}));
    adapter().initialize(passport);
    hook = {
      type: 'before',
      app: { passport },
      data: { name: 'Bob' },
      params: {
        provider: 'rest',
        headers: {
          authorization: 'JWT'
        },
        cookies: {
          'feathers-jwt': 'token'
        }
      }
    };
  });

  it('throws an error when strategy name is missing', () => {
    try {
      authenticate();
    } catch (error) {
      assert.equal(error.message, `The 'authenticate' hook requires one of your registered passport strategies.`);
    }
  });

  it('does nothing when provider is missing', () => {
    delete hook.params.provider;
    return authenticate('mock')(hook).then(returnedHook => {
      assert.deepEqual(returnedHook, hook);
    });
  });

  it('does nothing when hook is already authenticated', () => {
    hook.params.authenticated = true;
    return authenticate('mock')(hook).then(returnedHook => {
      assert.deepEqual(returnedHook, hook);
    });
  });

  it('returns an error when not called as a before hook', () => {
    hook.type = 'after';
    return authenticate('mock')(hook).catch(error => {
      assert.deepEqual(error.message, `The 'authenticate' hook should only be used as a 'before' hook.`);
    });
  });

  it('returns an error when strategy has not been registered with passport', () => {
    return authenticate('missing')(hook).catch(error => {
      assert.equal(error.message, `Authentication strategy 'missing' is not registered.`);
    });
  });

  it('normalizes request object for passport', () => {
    let arg = null;

    hook.app.authenticate = (...args) => {
      return mock => {
        arg = mock;
        return Promise.resolve({});
      };
    };

    authenticate('mock')(hook).then(() => {
      assert.deepEqual(arg, {
        query: hook.data,
        body: hook.data,
        params: hook.params,
        headers: hook.params.headers,
        cookies: hook.params.cookies,
        session: {}
      });
    });
  });

  it('throws error when strategy is not allowed', () => {
    hook.data.strategy = 'something';

    return authenticate('mock')(hook).then(() => {
      throw new Error('Should never get here');
    }).catch(error => {
      assert.equal(error.message, `Strategy 'something' is not permitted`);
    });
  });

  it('does nothing when authentication passes', () => {
    hook.app.authenticate = () => {
      return () => Promise.resolve({});
    };

    return authenticate('mock')(hook).then(returnedHook => {
      assert.deepEqual(returnedHook, hook);
    });
  });

  describe('when authentication succeeds', () => {
    let response;

    beforeEach(() => {
      response = {
        success: true,
        data: {
          user: { name: 'bob' },
          info: { platform: 'feathers' }
        }
      };
      hook.app.authenticate = () => {
        return () => Promise.resolve(response);
      };
    });

    it('exposes result to hook.params', () => {
      return authenticate('mock')(hook).then(hook => {
        assert.deepEqual(hook.params.user, response.data.user);
        assert.deepEqual(hook.params.info, response.data.info);
      });
    });

    it('sets hook.params.authenticated', () => {
      return authenticate('mock')(hook).then(hook => {
        assert.deepEqual(hook.params.authenticated, true);
      });
    });

    it('supports redirecting', () => {
      const successRedirect = '/app';
      return authenticate('mock', { successRedirect })(hook).then(hook => {
        assert.equal(hook.data.__redirect.status, 302);
        assert.equal(hook.data.__redirect.url, successRedirect);
      });
    });
  });

  describe('when authentication fails', () => {
    let response;

    beforeEach(() => {
      response = {
        fail: true,
        challenge: 'missing credentials'
      };
      hook.app.authenticate = () => {
        return () => Promise.resolve(response);
      };
    });

    it('returns an Unauthorized error', () => {
      return authenticate('mock')(hook).catch(error => {
        assert.equal(error.code, 401);
      });
    });

    it('does not set hook.params.authenticated', () => {
      return authenticate('mock')(hook).catch(() => {
        assert.equal(hook.params.authenticated, undefined);
      });
    });

    it('returns an error with challenge as the message', () => {
      return authenticate('mock')(hook).catch(error => {
        assert.equal(error.message, response.challenge);
      });
    });

    it('returns an error with the challenge message', () => {
      response.challenge = { message: 'missing credentials' };
      hook.app.authenticate = () => {
        return () => Promise.resolve(response);
      };
      authenticate('mock')(hook).catch(error => {
        assert.equal(error.code, 401);
        assert.equal(error.message, response.challenge.message);
      });
    });

    it('returns an error from a custom status code', () => {
      response.status = 400;
      hook.app.authenticate = () => {
        return () => Promise.resolve(response);
      };
      authenticate('mock')(hook).catch(error => {
        assert.equal(error.code, 400);
      });
    });

    it('supports custom error messages', () => {
      const failureMessage = 'Custom Error';
      authenticate('mock', { failureMessage })(hook).catch(error => {
        assert.equal(error.message, failureMessage);
      });
    });

    it('supports redirecting', () => {
      const failureRedirect = '/login';
      return authenticate('mock', { failureRedirect })(hook).catch(() => {
        assert.equal(hook.data.__redirect.status, 302);
        assert.equal(hook.data.__redirect.url, failureRedirect);
      });
    });
  });

  describe('when authentication errors', () => {
    beforeEach(() => {
      hook.app.authenticate = () => {
        return () => Promise.reject(new Error('Authentication Error'));
      };
    });

    it('returns an error', () => {
      return authenticate('mock')(hook).catch(error => {
        assert.equal(error.message, 'Authentication Error');
      });
    });

    it('does not set hook.params.authenticated', () => {
      return authenticate('mock')(hook).catch(() => {
        assert.equal(hook.params.authenticated, undefined);
      });
    });
  });

  describe('when authentication redirects', () => {
    let response;

    beforeEach(() => {
      response = {
        redirect: true,
        status: 302,
        url: '/app'
      };
      hook.app.authenticate = () => {
        return () => Promise.resolve(response);
      };
    });

    it('sets hook.data.__redirect', () => {
      return authenticate('mock')(hook).then(hook => {
        assert.equal(hook.data.__redirect.status, response.status);
        assert.equal(hook.data.__redirect.url, response.url);
      });
    });
  });
});
