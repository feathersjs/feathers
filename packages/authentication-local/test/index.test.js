import feathers from 'feathers';
import memory from 'feathers-memory';
import authentication from 'feathers-authentication';
import local, { Verifier } from '../src';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

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
      app.configure(local());
      expect(app.passport.use).to.have.been.calledWith('local');
      app.passport.use.restore();
    });

    describe('custom Verifier', () => {
      it('throws an error if a verify function is missing', () => {
        expect(() => {
          app.configure(local({ Verifier: {} }));
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

    describe('default options', () => {
      let options;
      before(() => {
        app.configure(local());
        options = app.get('auth').local;
      });

      it('sets options back onto global auth config', () => {
        expect(options).to.not.equal(undefined);
      });

      it('sets the name', () => {
        expect(options.name).to.equal('local');
      });

      it('sets the entity', () => {
        expect(options.entity).to.equal('user');
      });

      it('sets the service', () => {
        expect(options.service).to.equal('users');
      });

      it('sets the usernameField', () => {
        expect(options.usernameField).to.equal('email');
      });

      it('sets the passwordField', () => {
        expect(options.passwordField).to.equal('password');
      });

      it('sets passReqToCallback', () => {
        expect(options.passReqToCallback).to.equal(true);
      });

      it('disables sessions', () => {
        expect(options.session).to.equal(false);
      });
    });
  });
});
