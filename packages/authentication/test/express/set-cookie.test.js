/* eslint-disable no-unused-expressions */

import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import ms from 'ms';
import getOptions from '../../src/options';
import { setCookie } from '../../src/express';

chai.use(sinonChai);

describe('express:setCookie', () => {
  let req;
  let res;
  let options;

  beforeEach(() => {
    options = getOptions();
    req = {
      app: {
        get: () => {}
      },
      feathers: {}
    };
    res = {
      cookie: sinon.spy(),
      clearCookie: sinon.spy(),
      hook: { method: 'create' },
      data: {
        accessToken: 'token'
      }
    };
  });

  afterEach(() => {
    res.cookie.reset();
    res.clearCookie.reset();
  });

  describe('when cookies are not enabled', () => {
    it('calls next', next => {
      setCookie(options)(req, res, next);
    });

    it('does not clear cookie', done => {
      setCookie(options)(req, res, () => {
        expect(res.clearCookie).to.not.have.been.called;
        done();
      });
    });

    it('does not set cookie', done => {
      setCookie(options)(req, res, () => {
        expect(res.cookie).to.not.have.been.called;
        done();
      });
    });
  });

  describe('when cookies are enabled', () => {
    beforeEach(() => {
      options.cookie.enabled = true;
    });

    describe('when cookie name is missing', () => {
      beforeEach(() => {
        delete options.cookie.name;
      });

      it('does not clear the cookie', done => {
        setCookie(options)(req, res, () => {
          expect(res.clearCookie).to.not.have.been.called;
          done();
        });
      });

      it('does not set the cookie', done => {
        setCookie(options)(req, res, () => {
          expect(res.cookie).to.not.have.been.called;
          done();
        });
      });

      it('calls next', next => {
        setCookie(options)(req, res, next);
      });
    });

    it('clears cookie', done => {
      setCookie(options)(req, res, () => {
        expect(res.clearCookie).to.have.been.calledWith(options.cookie.name);
        done();
      });
    });

    it('sets cookie with default expiration of the configured jwt expiration', done => {
      const expiry = new Date(Date.now() + ms(options.jwt.expiresIn));
      setCookie(options)(req, res, () => {
        expect(res.cookie).to.have.been.calledWith('feathers-jwt', 'token');
        expect(res.cookie.getCall(0).args[2].httpOnly).to.equal(false);
        expect(res.cookie.getCall(0).args[2].secure).to.equal(true);
        expect(res.cookie.getCall(0).args[2].expires.toString()).to.equal(expiry.toString());
        done();
      });
    });

    it('sets cookie with expiration using maxAge', done => {
      const expiry = new Date(Date.now() + ms('1d'));
      options.cookie.maxAge = '1d';
      setCookie(options)(req, res, () => {
        expect(res.cookie).to.have.been.calledWith('feathers-jwt', 'token');
        expect(res.cookie.getCall(0).args[2].httpOnly).to.equal(false);
        expect(res.cookie.getCall(0).args[2].secure).to.equal(true);
        expect(res.cookie.getCall(0).args[2].expires.toString()).to.equal(expiry.toString());
        done();
      });
    });

    it('sets cookie with custom expiration', done => {
      const expiry = new Date(Date.now() + ms('1d'));
      const expectedOptions = {
        httpOnly: false,
        secure: true,
        expires: expiry
      };
      options.cookie.expires = expiry;

      setCookie(options)(req, res, () => {
        expect(res.cookie).to.have.been.calledWithExactly('feathers-jwt', 'token', expectedOptions);
        done();
      });
    });

    it('returns an error when expiration is not a date', done => {
      options.cookie.expires = true;
      setCookie(options)(req, res, error => {
        expect(error).to.not.equal(undefined);
        done();
      });
    });

    it('does not mutate given option object', done => {
      setCookie(options)(req, res, () => {
        expect(res.cookie.getCall(0).args[2].expires).to.be.defined;
        expect(options.expires).to.be.undefined;
        done();
      });
    });

    it('calls next', next => {
      setCookie(options)(req, res, next);
    });

    describe('when hook method is remove', () => {
      beforeEach(() => {
        res.hook.method = 'remove';
      });

      it('does not set the cookie', done => {
        setCookie(options)(req, res, () => {
          expect(res.cookie).to.not.have.been.called;
          done();
        });
      });

      it('calls next', next => {
        setCookie(options)(req, res, next);
      });
    });
  });
});
