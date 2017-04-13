/* eslint-disable no-unused-expressions */

import feathers from 'feathers';
import authentication from 'feathers-authentication';
import { Verifier } from '../src';
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
    user = { email: 'admin@feathersjs.com' };
    service = {
      id: 'id',
      get: sinon.stub().returns(Promise.resolve(user))
    };

    app.use('users', service)
      .configure(authentication({ secret: 'supersecret' }));

    options = app.get('auth');
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
          new Verifier(app, {}); // eslint-disable-line
        }).to.throw();
      });
    });
  });

  describe('verify', () => {
    describe('when userId is present in payload', () => {
      it('calls get on the provided service', done => {
        verifier.verify({}, { userId: 1 }, () => {
          expect(service.get).to.have.been.calledOnce;
          expect(service.get).to.have.been.calledWith(1);
          done();
        });
      });

      it('returns the payload', done => {
        const payload = { userId: 1 };
        verifier.verify({}, payload, (error, entity, p) => {
          expect(error).to.equal(null);
          expect(entity).to.deep.equal({});
          expect(p).to.deep.equal(payload);
          done();
        });
      });

      it('returns the entity', done => {
        verifier.verify({}, { userId: 1 }, (error, entity) => {
          expect(error).to.equal(null);
          expect(entity).to.deep.equal(user);
          done();
        });
      });

      describe('when service call errors', () => {
        it('returns the payload', done => {
          const service = {
            id: 'id',
            get: () => Promise.reject(new Error('User missing'))
          };

          options.service = service;
          const erroringVerifier = new Verifier(app, options);
          const payload = { userId: 1 };
          erroringVerifier.verify({}, payload, (error, entity, p) => {
            expect(error).to.equal(null);
            expect(entity).to.deep.equal({});
            expect(p).to.deep.equal(payload);
            done();
          });
        });
      });
    });

    describe('when userId is not present in payload', () => {
      it('does not call get on the provided service', done => {
        verifier.verify({}, {}, () => {
          expect(service.get).to.not.have.been.called;
          done();
        });
      });

      it('returns the payload', done => {
        const payload = { name: 'Eric' };
        verifier.verify({}, payload, (error, entity, p) => {
          expect(error).to.equal(null);
          expect(entity).to.deep.equal({});
          expect(p).to.deep.equal(payload);
          done();
        });
      });
    });
  });
});
