import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import handler from '../../src/express/handler';

chai.use(sinonChai);

describe('express:handler', () => {
  let req;
  let res;
  let service;
  let options;
  let user;
  let payload;
  let accessToken = 'access';

  beforeEach(() => {
    payload = { userId: 1 };
    user = { name: 'Bob' };
    options = { entity: 'user', name: 'github' };
    service = {
      create: sinon.stub().returns(Promise.resolve({ accessToken }))
    };

    req = {
      user,
      payload,
      app: {
        get: sinon.stub().returns({ path: '/authentication' }),
        service: sinon.stub().returns(service)
      }
    };
    res = {};
  });

  afterEach(() => {
    req.app.service.reset();
    service.create.reset();
  });

  it('calls create on the authentication service', done => {
    const params = {
      authenticated: true,
      payload,
      user
    };

    handler(options)(req, res, () => {
      expect(req.app.service).to.have.been.calledOnce;
      expect(req.app.service).to.have.been.calledWith('/authentication');
      expect(service.create).to.have.been.calledOnce;
      expect(service.create).to.have.been.calledWith({ user, payload }, params);
      done();
    });
  });

  describe('when create succeeds', () => {
    it('sets res.data', done => {
      handler(options)(req, res, () => {
        expect(res.data).to.deep.equal({ accessToken });
        done();
      });
    });

    it('calls next', done => {
      handler(options)(req, res, done);
    });

    describe('when successRedirect is set', () => {
      it('sets the redirect object on the request', done => {
        options.successRedirect = '/app';
        handler(options)(req, res, () => {
          expect(res.hook.data.__redirect).to.deep.equal({ status: 302, url: options.successRedirect });
          done();
        });
      });
    });
  });

  describe('when create fails', () => {
    beforeEach(() => {
      service.create = sinon.stub().returns(Promise.reject(new Error('Auth Error')));
      req.app.service = sinon.stub().returns(service);
    });

    it('calls next with an error', done => {
      handler(options)(req, res, error => {
        expect(error).to.not.equal(undefined);
        done();
      });
    });
  });
});
