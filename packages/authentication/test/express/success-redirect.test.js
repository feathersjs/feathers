import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { successRedirect } from '../../src/express';

chai.use(sinonChai);

describe('express:successRedirect', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      hook: {
        redirect: {
          url: '/app'
        }
      }
    };
    res = {
      redirect: sinon.spy(),
      status: sinon.spy()
    };
  });

  afterEach(() => {
    res.redirect.reset();
    res.status.reset();
  });

  describe('when redirect is set on the hook', () => {
    it('redirects to configured endpoint with default status code', () => {
      successRedirect()(req, res);
      expect(res.status).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(302);
      expect(res.redirect).to.have.been.calledOnce;
      expect(res.redirect).to.have.been.calledWith('/app');
    });

    it('supports a custom status code', () => {
      req.hook.redirect.status = 400;
      successRedirect()(req, res);
      expect(res.status).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(400);
      expect(res.redirect).to.have.been.calledOnce;
      expect(res.redirect).to.have.been.calledWith('/app');
    });
  });

  describe('when req.hook is not defined', () => {
    it('calls next', next => {
      delete req.hook;
      successRedirect()(req, res, next);
    });
  });

  describe('when req.hook.redirect is not defined', () => {
    it('calls next', next => {
      delete req.hook.redirect;
      successRedirect()(req, res, next);
    });
  });
});