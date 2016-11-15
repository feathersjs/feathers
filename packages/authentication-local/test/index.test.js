import feathers from 'feathers';
import memory from 'feathers-memory';
import authentication from 'feathers-authentication';
import local, { Verifier } from '../src';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import passportLocal from 'passport-local';

chai.use(sinonChai);

describe('feathers-authentication-local', () => {
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
      app = feathers();
      app.use('/users', memory());
      app.configure(authentication({ secret: 'supersecret' }));
    });

    it('throws an error if passport has not been registered', () => {      
      expect(() => {
        feathers().configure(local());
      }).to.throw();
    });

    it('registers the local passport strategy', () => {
      sinon.spy(app.passport, 'use');
      sinon.spy(passportLocal, 'Strategy');
      app.configure(local());

      expect(passportLocal.Strategy).to.have.been.calledOnce;
      expect(app.passport.use).to.have.been.calledWith('local');
      
      app.passport.use.restore();
      passportLocal.Strategy.restore();
    });

    describe('passport strategy options', () => {
      let authOptions;
      let args;

      beforeEach(() => {
        sinon.spy(passportLocal, 'Strategy');
        app.configure(local({ custom: true }));
        authOptions = app.get('auth');
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

      it('supports overriding default options', () => {
        app.configure(local({ usernameField: 'username' }));
        expect(passportLocal.Strategy.getCall(1).args[0].usernameField).to.equal('username');
      });
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
          verify(req, username, password, done) {
            expect(username).to.equal(User.email);
            expect(password).to.equal(User.password);
            done(null, User);
          }
        }

        app.configure(local({ Verifier: CustomVerifier }));

        return app.authenticate('local')(req).then(result => {
          expect(result.data.user).to.deep.equal(User);
        });
      });
    });
  });
});
