/* eslint-disable no-unused-expressions */

import passport from 'passport';
import MockStrategy from '../fixtures/strategy';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { authenticate } from '../../src/hooks';

chai.use(sinonChai);

describe('hooks:authenticate', () => {
  let hook;
  let authenticator;

  beforeEach(() => {
    passport.use(new MockStrategy({}, () => {}));
    authenticator = sinon.stub().returns(Promise.resolve());
    hook = {
      type: 'before',
      app: {
        passport,
        authenticate: () => {
          return authenticator;
        }
      },
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

  afterEach(() => {
    authenticator.reset();
  });

  describe('when strategy name is missing', () => {
    it('throws an error', () => {
      expect(() => {
        authenticate()(hook);
      }).to.throw;
    });
  });

  describe('when provider is missing', () => {
    it('does nothing', () => {
      delete hook.params.provider;
      return authenticate('mock')(hook).then(returnedHook => {
        expect(returnedHook).to.deep.equal(hook);
      });
    });
  });

  describe('when hook is already authenticated', () => {
    it('does nothing', () => {
      hook.params.authenticated = true;
      return authenticate('mock')(hook).then(returnedHook => {
        expect(returnedHook).to.deep.equal(hook);
      });
    });
  });

  describe('when not called as a before hook', () => {
    it('returns an error', () => {
      hook.type = 'after';
      return authenticate('mock')(hook).catch(error => {
        expect(error).to.not.equal(undefined);
      });
    });
  });

  describe('when strategy has not been registered with passport', () => {
    it('returns an error', () => {
      return authenticate('missing')(hook).catch(error => {
        expect(error).to.not.equal(undefined);
      });
    });
  });

  it('normalizes request object for passport', () => {
    return authenticate('mock')(hook).then(() => {
      expect(authenticator).to.have.been.called;
      expect(authenticator).to.have.been.calledWith({
        query: hook.data,
        body: hook.data,
        params: hook.params,
        headers: hook.params.headers,
        cookies: hook.params.cookies,
        session: {}
      });
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
        expect(hook.params.user).to.deep.equal(response.data.user);
        expect(hook.params.info).to.deep.equal(response.data.info);
      });
    });

    it('sets hook.params.authenticated', () => {
      return authenticate('mock')(hook).then(hook => {
        expect(hook.params.authenticated).to.equal(true);
      });
    });

    it('supports redirecting', () => {
      const successRedirect = '/app';
      return authenticate('mock', { successRedirect })(hook).then(hook => {
        expect(hook.data.__redirect.status).to.equal(302);
        expect(hook.data.__redirect.url).to.equal(successRedirect);
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
        expect(error.code).to.equal(401);
      });
    });

    it('does not set hook.params.authenticated', () => {
      return authenticate('mock')(hook).catch(() => {
        expect(hook.params.authenticated).to.equal(undefined);
      });
    });

    it('returns an error with challenge as the message', () => {
      return authenticate('mock')(hook).catch(error => {
        expect(error.message).to.equal(response.challenge);
      });
    });

    it('returns an error with the challenge message', () => {
      response.challenge = { message: 'missing credentials' };
      hook.app.authenticate = () => {
        return () => Promise.resolve(response);
      };
      authenticate('mock')(hook).catch(error => {
        expect(error.code).to.equal(401);
        expect(error.message).to.equal(response.challenge.message);
      });
    });

    it('returns an error from a custom status code', () => {
      response.status = 400;
      hook.app.authenticate = () => {
        return () => Promise.resolve(response);
      };
      authenticate('mock')(hook).catch(error => {
        expect(error.code).to.equal(400);
      });
    });

    it('supports custom error messages', () => {
      const failureMessage = 'Custom Error';
      authenticate('mock', { failureMessage })(hook).catch(error => {
        expect(error.message).to.equal(failureMessage);
      });
    });

    it('supports redirecting', () => {
      const failureRedirect = '/login';
      return authenticate('mock', { failureRedirect })(hook).catch(() => {
        expect(hook.data.__redirect.status).to.equal(302);
        expect(hook.data.__redirect.url).to.equal(failureRedirect);
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
        expect(error).to.not.equal(undefined);
      });
    });

    it('does not set hook.params.authenticated', () => {
      return authenticate('mock')(hook).catch(() => {
        expect(hook.params.authenticated).to.equal(undefined);
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
        expect(hook.data.__redirect.status).to.equal(response.status);
        expect(hook.data.__redirect.url).to.equal(response.url);
      });
    });
  });

  describe('when authentication passes', () => {
    it('does nothing', () => {
      return authenticate('mock')(hook).then(returnedHook => {
        expect(returnedHook).to.deep.equal(hook);
      });
    });
  });
});
