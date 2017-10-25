/* eslint-disable no-unused-expressions */
const feathers = require('@feathersjs/feathers');
const expressify = require('@feathersjs/express');
const authentication = require('@feathersjs/authentication');
const memory = require('feathers-memory');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const passportLocal = require('passport-local');
const local = require('../lib');

const { Verifier } = local;
const { expect } = chai;

chai.use(sinonChai);

describe('@feathersjs/authentication-local', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../lib')).to.equal('function');
  });

  it('basic functionality', () => {
    expect(typeof local).to.equal('function');
  });

  it('exposes hooks', () => {
    expect(typeof local.hooks).to.equal('object');
  });

  it('exposes the Verifier class', () => {
    expect(typeof Verifier).to.equal('function');
    expect(typeof local.Verifier).to.equal('function');
  });

  describe('initialization', () => {
    let app;

    beforeEach(() => {
      app = expressify(feathers());
      app.use('/users', memory());
      app.configure(authentication({ secret: 'supersecret' }));
    });

    it('throws an error if passport has not been registered', () => {
      expect(() => {
        expressify(feathers()).configure(local());
      }).to.throw();
    });

    it('registers the local passport strategy', () => {
      sinon.spy(app.passport, 'use');
      sinon.spy(passportLocal, 'Strategy');
      app.configure(local());
      app.setup();

      expect(passportLocal.Strategy).to.have.been.calledOnce;
      expect(app.passport.use).to.have.been.calledWith('local');

      app.passport.use.restore();
      passportLocal.Strategy.restore();
    });

    it('registers the strategy options', () => {
      sinon.spy(app.passport, 'options');
      app.configure(local());
      app.setup();

      expect(app.passport.options).to.have.been.calledOnce;

      app.passport.options.restore();
    });

    describe('passport strategy options', () => {
      let authOptions;
      let args;

      beforeEach(() => {
        sinon.spy(passportLocal, 'Strategy');
        app.configure(local({ custom: true }));
        app.setup();
        authOptions = app.get('authentication');
        args = passportLocal.Strategy.getCall(0).args[0];
      });

      afterEach(() => {
        passportLocal.Strategy.restore();
      });

      it('sets usernameField', () => {
        expect(args.usernameField).to.equal('email');
      });

      it('sets passwordField', () => {
        expect(args.passwordField).to.equal('password');
      });

      it('sets entity', () => {
        expect(args.entity).to.equal(authOptions.entity);
      });

      it('sets service', () => {
        expect(args.service).to.equal(authOptions.service);
      });

      it('sets session', () => {
        expect(args.session).to.equal(authOptions.session);
      });

      it('sets passReqToCallback', () => {
        expect(args.passReqToCallback).to.equal(authOptions.passReqToCallback);
      });

      it('supports setting custom options', () => {
        expect(args.custom).to.equal(true);
      });
    });

    it('supports overriding default options', () => {
      sinon.spy(passportLocal, 'Strategy');
      app.configure(local({ usernameField: 'username' }));
      app.setup();

      expect(passportLocal.Strategy.getCall(0).args[0].usernameField).to.equal('username');

      passportLocal.Strategy.restore();
    });

    it('pulls options from global config', () => {
      sinon.spy(passportLocal, 'Strategy');
      let authOptions = app.get('authentication');
      authOptions.local = { usernameField: 'username' };
      app.set('authentication', authOptions);

      app.configure(local());
      app.setup();

      expect(passportLocal.Strategy.getCall(0).args[0].usernameField).to.equal('username');
      expect(passportLocal.Strategy.getCall(0).args[0].passwordField).to.equal('password');

      passportLocal.Strategy.restore();
    });

    it('pulls options from global config with custom name', () => {
      sinon.spy(passportLocal, 'Strategy');
      let authOptions = app.get('authentication');
      authOptions.custom = { usernameField: 'username' };
      app.set('authentication', authOptions);

      app.configure(local({ name: 'custom' }));
      app.setup();

      expect(passportLocal.Strategy.getCall(0).args[0].usernameField).to.equal('username');
      expect(passportLocal.Strategy.getCall(0).args[0].passwordField).to.equal('password');

      passportLocal.Strategy.restore();
    });

    describe('custom Verifier', () => {
      it('throws an error if a verify function is missing', () => {
        expect(() => {
          class CustomVerifier {
            constructor (app) {
              this.app = app;
            }
          }
          app.configure(local({ Verifier: CustomVerifier }));
          app.setup();
        }).to.throw();
      });

      it('verifies through custom verify function', () => {
        const User = {
          email: 'admin@feathersjs.com',
          password: 'password'
        };

        const req = {
          query: {},
          body: Object.assign({}, User),
          headers: {},
          cookies: {}
        };
        class CustomVerifier extends Verifier {
          verify (req, username, password, done) {
            expect(username).to.equal(User.email);
            expect(password).to.equal(User.password);
            done(null, User);
          }
        }

        app.configure(local({ Verifier: CustomVerifier }));
        app.setup();

        return app.authenticate('local')(req).then(result => {
          expect(result.data.user).to.deep.equal(User);
        });
      });
    });
  });
});
