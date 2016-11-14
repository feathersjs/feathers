import feathers from 'feathers';
import authentication from 'feathers-authentication';
import hasher from '../src/utils/hash';
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

    return hasher('admin').then(password => {
      user = {
        email: 'admin@feathersjs.com',
        password 
      };

      service = {
        find: sinon.stub().returns(Promise.resolve([user]))
      };

      app.use('users', service)
        .configure(authentication({ secret: 'supersecret' }));

      options = Object.assign({}, defaults, app.get('auth'));

      verifier = new Verifier(app, options);
    });
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
          new Verifier(app, {});
        }).to.throw();
      });
    });
  });

  describe('comparePassword', () => {
    describe('when entity is missing password field', () => {
      it('returns an error', () => {
        return verifier.comparePassword({}).catch(error => {
          expect(error).to.not.equal(undefined);
        });
      });
    });

    describe('password comparison fails', () => {
      it('rejects with false', () => {
        return verifier.comparePassword(user, 'invalid').catch(error => {
          expect(error).to.equal(false);
        });
      });
    });

    describe('password comparison succeeds', () => {
      it('returns the entity', () => {
        return verifier.comparePassword(user, 'admin').then(result => {
          expect(result).to.deep.equal(user);
        });
      });
    });
  });

  describe('normalizeResult', () => {
    describe('when has results', () => {
      it('returns entity when paginated', () => {  
        return verifier.normalizeResult({ data: [user] }).then(result => {
          expect(result).to.deep.equal(user);
        });
      });

      it('returns entity when not paginated', () => {  
        return verifier.normalizeResult([user]).then(result => {
          expect(result).to.deep.equal(user);
        });
      });
    });

    describe('when no results', () => {
      it('rejects with false when paginated', () => {  
        return verifier.normalizeResult({ data: [] }).catch(error => {
          expect(error).to.equal(false);
        });
      });

      it('rejects with false when not paginated', () => {  
        return verifier.normalizeResult([]).catch(error => {
          expect(error).to.equal(false);
        });
      });
    });
  });

  describe('verify', () => {
    it('calls find on the provided service', done => {
      verifier.verify({}, user.email, 'admin', () => {
        const query = { email: user.email, $limit: 1 };
        expect(service.find).to.have.been.calledOnce;
        expect(service.find).to.have.been.calledWith({ query });
        done();
      });
    });

    it('calls normalizeResult', done => {
      sinon.spy(verifier, 'normalizeResult');
      verifier.verify({}, user.email, 'admin', () => {
        expect(verifier.normalizeResult).to.have.been.calledOnce;
        verifier.normalizeResult.restore();
        done();
      });
    });

    it('calls comparePassword', done => {
      sinon.spy(verifier, 'comparePassword');
      verifier.verify({}, user.email, 'admin', () => {
        expect(verifier.comparePassword).to.have.been.calledOnce;
        verifier.comparePassword.restore();
        done();
      });
    });

    it('returns the entity', done => {
      verifier.verify({}, user.email, 'admin', (error, entity) => {
        expect(error).to.equal(null);
        expect(entity).to.deep.equal(user);
        done();
      });
    });

    it('handles false rejections in promise chain', () => {
      verifier.normalizeResult = () => Promise.reject(false);
      verifier.verify({}, user.email, 'admin', (error, entity) => {
        expect(error).to.equal(null);
        expect(entity).to.equal(false);
        done();
      });
    });

    it('returns errors', () => {
      const authError = new Error('An error');
      verifier.normalizeResult = () => Promise.reject(authError);
      verifier.verify({}, user.email, 'admin', (error, entity) => {
        expect(error).to.equal(authError);
        expect(entity).to.equal(undefined);
        done();
      });
    });
  });
});
