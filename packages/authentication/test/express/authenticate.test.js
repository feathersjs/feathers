/* eslint-disable no-unused-expressions */

import passport from 'passport';
import MockStrategy from '../fixtures/strategy';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { authenticate } from '../../src/express';

chai.use(sinonChai);

describe('express:authenticate', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    passport.use(new MockStrategy({}, () => {}));
    req = {
      feathers: {},
      app: {
        passport,
        authenticate: () => {
          return () => Promise.resolve();
        }
      }
    };
    res = {
      status: sinon.spy()
    };
    next = sinon.spy();
  });

  afterEach(() => {
    next.reset();
    res.status.reset();
  });

  describe('when strategy name is missing', () => {
    it('throws an error', () => {
      expect(() => {
        authenticate()(req, res, next);
      }).to.throw;
    });
  });

  describe('when already authenticated', () => {
    it('calls next', next => {
      req.authenticated = true;
      authenticate('missing')(req, res, next);
    });
  });

  describe('when strategy has not been registered with passport', () => {
    it('returns an error', done => {
      authenticate('missing')(req, res, error => {
        expect(error).to.not.equal(undefined);
        done();
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
      req.app.authenticate = () => {
        return () => Promise.resolve(response);
      };
    });

    it('calls next', next => {
      authenticate('mock')(req, res, next);
    });

    it('exposes result to express request object', done => {
      authenticate('mock')(req, res, () => {
        expect(req.user).to.deep.equal(response.data.user);
        expect(req.info).to.deep.equal(response.data.info);
        done();
      });
    });

    it('sets request.authenticated', done => {
      authenticate('mock')(req, res, () => {
        expect(req.authenticated).to.equal(true);
        done();
      });
    });

    it('exposes result to feathers', done => {
      authenticate('mock')(req, res, () => {
        expect(req.feathers.user).to.deep.equal(response.data.user);
        expect(req.feathers.info).to.deep.equal(response.data.info);
        done();
      });
    });

    it('sets request.feathers.authenticated', done => {
      authenticate('mock')(req, res, () => {
        expect(req.feathers.authenticated).to.equal(true);
        done();
      });
    });

    it('supports redirecting', done => {
      const successRedirect = '/app';

      res.redirect = url => {
        expect(res.status).to.have.been.calledWith(302);
        expect(next).to.not.be.called;
        expect(url).to.equal(successRedirect);
        done();
      };

      authenticate('mock', { successRedirect })(req, res, next);
    });
  });

  describe('when authentication fails', () => {
    let response;

    beforeEach(() => {
      response = {
        fail: true,
        challenge: 'missing credentials'
      };
      req.app.authenticate = () => {
        return () => Promise.resolve(response);
      };
    });

    it('returns an Unauthorized error', done => {
      authenticate('mock')(req, res, error => {
        expect(error.code).to.equal(401);
        done();
      });
    });

    it('returns an error with challenge as the message', done => {
      authenticate('mock')(req, res, error => {
        expect(error.message).to.equal(response.challenge);
        done();
      });
    });

    it('returns an error with the challenge message', done => {
      response.challenge = { message: 'missing credentials' };
      req.app.authenticate = () => {
        return () => Promise.resolve(response);
      };
      authenticate('mock')(req, res, error => {
        expect(error.code).to.equal(401);
        expect(error.message).to.equal(response.challenge.message);
        done();
      });
    });

    it('returns an error from a custom status code', done => {
      response.status = 400;
      req.app.authenticate = () => {
        return () => Promise.resolve(response);
      };
      authenticate('mock')(req, res, error => {
        expect(error.code).to.equal(400);
        done();
      });
    });

    it('supports custom error messages', done => {
      const failureMessage = 'Custom Error';
      authenticate('mock', { failureMessage })(req, res, error => {
        expect(error.message).to.equal(failureMessage);
        done();
      });
    });

    it('supports redirecting', done => {
      const failureRedirect = '/login';

      res.redirect = (url) => {
        expect(next).to.not.be.called;
        expect(res.status).to.have.been.calledWith(302);
        expect(url).to.equal(failureRedirect);
        done();
      };

      authenticate('mock', { failureRedirect })(req, res, next);
    });
  });

  describe('when authentication errors', () => {
    beforeEach(() => {
      req.app.authenticate = () => {
        return () => Promise.reject(new Error('Authentication Error'));
      };
    });

    it('returns an error', done => {
      authenticate('mock')(req, res, error => {
        expect(error).to.not.equal(undefined);
        done();
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
      req.app.authenticate = () => {
        return () => Promise.resolve(response);
      };
    });

    it('redirects', done => {
      res.redirect = url => {
        expect(next).to.not.be.called;
        expect(res.status).to.have.been.calledWith(response.status);
        expect(url).to.equal(response.url);
        done();
      };

      authenticate('mock')(req, res, next);
    });
  });

  describe('when authentication passes', () => {
    it('calls next', next => {
      authenticate('mock')(req, res, next);
    });
  });
});
