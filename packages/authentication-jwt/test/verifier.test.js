import feathers from 'feathers';
import { Verifier, defaults } from '../src';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

describe('Verifier', () => {
  let service;
  let app;
  let options;
  let verifier;
  let user;

  beforeEach(() => {
    app = feathers();
    options = Object.assign({}, defaults);
    user = { email: 'admin@feathersjs.com' };
    service = {
      id: 'id',
      get: sinon.stub().returns(Promise.resolve(user))
    };

    app.use('users', service);
    verifier = new Verifier(app, options);
  });

  it('is CommonJS compatible', () => {
    expect(typeof require('../lib/verifier')).to.equal('function');
  });

  it('exposes the Verifier class', () => {
    expect(typeof Verifier).to.equal('function');
  });

  describe('constructor', () => {
    it('retains an app reference', () => {
      expect(verifier.app).to.deep.equal(app);
    });

    it('sets options', () => {
      expect(verifier.options).to.deep.equal(options);
    });

    it('sets service using service path', () => {
      expect(verifier.service).to.deep.equal(app.service('users'));
    });

    it('sets a passed in service instance', () => {
      options.service = service;
      expect(new Verifier(app, options).service).to.deep.equal(service);
    });

    describe('when service is undefined', () => {
      it('throws an error', () => {
        expect(() => {
          Verifier(app, {});
        }).to.throw();
      });
    });
  });

  describe('verify', () => {
    describe('when id is present in payload', () => {
      it('calls get on the provided service', done => {
        verifier.verify({}, { id: 1 }, () => {
          expect(service.get).to.have.been.calledOnce;
          expect(service.get).to.have.been.calledWith(1);
          done();
        });
      });

      it('returns the payload', done => {
        const payload = { id: 1 };
        verifier.verify({}, payload, (error, result) => {
          expect(error).to.equal(null);
          expect(result.payload).to.deep.equal(payload);
          done();
        });
      });

      it('returns the user', done => {
        verifier.verify({}, { id: 1 }, (error, result) => {
          expect(error).to.equal(null);
          expect(result.email).to.deep.equal(user.email);
          done();
        });
      });
    });

    describe('when id is not present in payload', () => {
      it('does not call get on the provided service', done => {
        verifier.verify({}, {}, () => {
          expect(service.get).to.not.have.been.called;
          done();
        });
      });

      it('returns the payload', done => {
        const payload = { name: 'Eric' };
        verifier.verify({}, payload, (error, response) => {
          expect(error).to.equal(null);
          expect(response.payload).to.deep.equal(payload);
          done();
        });
      });
    });
  });
});
