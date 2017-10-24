/* eslint-disable no-unused-expressions */
const feathers = require('feathers');
const authentication = require('feathers-authentication');
const hasher = require('../lib/utils/hash');
const { Verifier, defaults } = require('../lib');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const { expect } = require('chai');

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
        id: 'id',
        find () {}
      };

      sinon.stub(service, 'find').callsFake(function (params) {
        return new Promise((resolve, reject) => {
          const { email } = params && params.query;
          if (email === 'nonexistinguser@gmail.com') {
            return resolve([]);
          }
          return resolve([user]);
        });
      });

      app.use('users', service)
        .configure(authentication({ secret: 'supersecret' }));

      options = Object.assign({}, defaults, app.get('authentication'));

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
          new Verifier(app, {}); // eslint-disable-line
        }).to.throw();
      });
    });
  });

  describe('_comparePassword', () => {
    describe('when entity is missing password field', () => {
      it('returns an error', () => {
        return verifier._comparePassword({}).catch(error => {
          expect(error).to.not.equal(undefined);
        });
      });
    });

    describe('password comparison fails', () => {
      it('rejects with false', () => {
        return verifier._comparePassword(user, 'invalid').catch(error => {
          expect(error).to.equal(false);
        });
      });
    });

    describe('password comparison succeeds', () => {
      it('returns the entity', () => {
        return verifier._comparePassword(user, 'admin').then(result => {
          expect(result).to.deep.equal(user);
        });
      });

      it('allows dot notation for password field', () => {
        user.password = {
          value: user.password
        };

        verifier.options.passwordField = 'password.value';

        return verifier._comparePassword(user, 'admin').then(result => {
          expect(result).to.deep.equal(user);
        });
      });

      it('prefers entityPasswordField over passwordField', () => {
        user.password = {
          value: user.password
        };

        verifier.options.passwordField = 'password';
        verifier.options.entityPasswordField = 'password.value';

        return verifier._comparePassword(user, 'admin').then(result => {
          expect(result).to.deep.equal(user);
        });
      });
    });
  });

  describe('_normalizeResult', () => {
    describe('when has results', () => {
      it('returns entity when paginated', () => {
        return verifier._normalizeResult({ data: [user] }).then(result => {
          expect(result).to.deep.equal(user);
        });
      });

      it('returns entity when not paginated', () => {
        return verifier._normalizeResult([user]).then(result => {
          expect(result).to.deep.equal(user);
        });
      });
    });

    describe('when no results', () => {
      it('rejects with false when paginated', () => {
        return verifier._normalizeResult({ data: [] }).catch(error => {
          expect(error).to.equal(false);
        });
      });

      it('rejects with false when not paginated', () => {
        return verifier._normalizeResult([]).catch(error => {
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

    it('allows overriding of usernameField', done => {
      verifier.options.usernameField = 'username';

      user.username = 'username';

      verifier.verify({}, 'username', 'admin', (error, entity) => {
        expect(error).to.equal(null);
        expect(entity).to.deep.equal(user);
        done();
      });
    });

    it('prefers entityUsernameField over usernameField', done => {
      verifier.options.usernameField = 'username';
      verifier.options.entityUsernameField = 'users.username';

      user.username = 'invalid';

      user.users = {
        username: 'valid'
      };

      verifier.verify({}, 'valid', 'admin', (error, entity) => {
        expect(error).to.equal(null);
        expect(entity).to.deep.equal(user);
        done();
      });
    });

    it('calls _normalizeResult', done => {
      sinon.spy(verifier, '_normalizeResult');
      verifier.verify({}, user.email, 'admin', () => {
        expect(verifier._normalizeResult).to.have.been.calledOnce;
        verifier._normalizeResult.restore();
        done();
      });
    });

    it('produces an error message when the user did not exist', done => {
      verifier.verify({}, 'nonexistinguser@gmail.com', 'admin', (err, user, info) => {
        expect(err).to.not.be.undefined;
        expect(info.message).to.equal('Invalid login');
        done();
      });
    });

    it('calls _comparePassword', done => {
      sinon.spy(verifier, '_comparePassword');
      verifier.verify({}, user.email, 'admin', () => {
        expect(verifier._comparePassword).to.have.been.calledOnce;
        verifier._comparePassword.restore();
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

    it('handles false rejections in promise chain', (done) => {
      verifier._normalizeResult = () => Promise.reject(false); // eslint-disable-line
      verifier.verify({}, user.email, 'admin', (error, entity) => {
        expect(error).to.equal(null);
        expect(entity).to.equal(false);
        done();
      });
    });

    it('returns errors', (done) => {
      const authError = new Error('An error');
      verifier._normalizeResult = () => Promise.reject(authError);
      verifier.verify({}, user.email, 'admin', (error, entity) => {
        expect(error).to.equal(authError);
        expect(entity).to.equal(undefined);
        done();
      });
    });
  });
});

describe('Verifier without service.id', function () {
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

      // testing a missing service.id
      service = {
        find () {
          return Promise.resolve([]);
        }
      };

      app.use('users', service)
        .configure(authentication({ secret: 'supersecret' }));

      options = Object.assign({}, defaults, app.get('authentication'));

      verifier = new Verifier(app, options);
    });
  });

  it('throws an error when service.id is not set', done => {
    verifier.verify({}, user.email, 'admin', (error, entity) => {
      expect(error.message.includes('the `id` property must be set')).to.equal(true);
      expect(entity).to.equal(undefined);
      done();
    });
  });
});
