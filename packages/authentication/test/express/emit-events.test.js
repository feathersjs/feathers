/* eslint-disable no-unused-expressions */
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { emitEvents } = require('../../lib/express');
const { expect } = chai;

chai.use(sinonChai);

describe('express:emitEvents', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      app: {
        emit: sinon.spy()
      }
    };
    res = {
      hook: {
        method: 'create'
      },
      data: {
        accessToken: 'token'
      }
    };
  });

  afterEach(() => {
    req.app.emit.resetHistory();
  });

  it('calls next', next => {
    emitEvents()(req, res, next);
  });

  describe('when res.data is missing', () => {
    it('does not call app.emit', done => {
      delete res.data;
      emitEvents()(req, res, () => {
        expect(req.app.emit).to.not.have.been.called;
        done();
      });
    });
  });

  describe('when res.data.accessToken is missing', () => {
    it('does not call app.emit', done => {
      delete res.data.accessToken;
      emitEvents()(req, res, () => {
        expect(req.app.emit).to.not.have.been.called;
        done();
      });
    });
  });

  describe('when create method was called', () => {
    it('emits login event', done => {
      emitEvents()(req, res, () => {
        expect(req.app.emit).to.have.been.calledOnce;
        expect(req.app.emit).to.have.been.calledWith('login', res.data, { provider: 'rest', req, res });
        done();
      });
    });
  });

  describe('when remove method was called', () => {
    it('emits logout event', done => {
      res.hook.method = 'remove';
      emitEvents()(req, res, () => {
        expect(req.app.emit).to.have.been.calledOnce;
        expect(req.app.emit).to.have.been.calledWith('logout', res.data, { provider: 'rest', req, res });
        done();
      });
    });
  });
});
