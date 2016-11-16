import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { failureRedirect } from '../../src/express';

chai.use(sinonChai);

describe('express:failureRedirect', () => {
  let req;
  let res;
  let error;

  beforeEach(() => {
    req = {
      hook: {
        redirect: {
          url: '/app'
        }
      }
    };
    res = {
      clearCookie: sinon.spy(),
      redirect: sinon.spy(),
      status: sinon.spy()
    };
    error = new Error('Authentication Error');
  });

  afterEach(() => {
    res.clearCookie.reset();
    res.redirect.reset();
    res.status.reset();
  });

  describe('when redirect is set on the hook', () => {
    it('redirects to configured endpoint with default status code', () => {
      failureRedirect()(error, req, res);
      expect(res.status).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(302);
      expect(res.redirect).to.have.been.calledOnce;
      expect(res.redirect).to.have.been.calledWith('/app');
    });

    it('supports a custom status code', () => {
      req.hook.redirect.status = 400;
      failureRedirect()(error, req, res);
      expect(res.status).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(400);
      expect(res.redirect).to.have.been.calledOnce;
      expect(res.redirect).to.have.been.calledWith('/app');
    });
  });

  describe('when cookie is enabled', () => {
    it('clears cookie', () => {
      const options = {
        cookie: {
          enabled: true,
          name: 'feathers-jwt'
        }
      };

      failureRedirect(options)(error, req, res);
      expect(res.clearCookie).to.have.been.calledOnce;
      expect(res.clearCookie).to.have.been.calledWith(options.cookie.name);
    });
  });

  describe('when req.hook is not defined', done => {
    it('calls next with error', done => {
      delete req.hook;
      failureRedirect()(error, req, res, e => {
        expect(e).to.equal(error);
        done();
      });
    });
  });

  describe('when req.hook.redirect is not defined', done => {
    it('calls next with error', done => {
      delete req.hook.redirect;
      failureRedirect()(error, req, res, e => {
        expect(e).to.equal(error);
        done();
      });
    });
  });
});