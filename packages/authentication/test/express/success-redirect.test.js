/* eslint-disable no-unused-expressions */

import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { successRedirect } from '../../src/express';

chai.use(sinonChai);

describe('express:successRedirect', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {};
    res = {
      hook: {
        data: {
          __redirect: {
            url: '/app'
          }
        }
      },
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
      res.hook.data.__redirect.status = 400;
      successRedirect()(req, res);
      expect(res.status).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(400);
      expect(res.redirect).to.have.been.calledOnce;
      expect(res.redirect).to.have.been.calledWith('/app');
    });
  });

  describe('when res.hook is not defined', () => {
    it('calls next', next => {
      delete res.hook;
      successRedirect()(req, res, next);
    });
  });

  describe('when res.hook.data.__redirect is not defined', () => {
    it('calls next', next => {
      delete res.hook.data.__redirect;
      successRedirect()(req, res, next);
    });
  });
});
