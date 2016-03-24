import authentication from '../../src';
import feathers from 'feathers';
import hooks from 'feathers-hooks';
import rest from 'feathers-rest';
import { expect } from 'chai';
import { Strategy } from 'passport-facebook';

describe('Feathers Authentication', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../../lib')).to.equal('function');
  });

  it('is ES6 compatible', () => {
    expect(typeof authentication).to.equal('function');
  });

  it('exposes hooks', () => {
    expect(typeof authentication.hooks).to.equal('object');
  });

  describe('config options', () => {
    describe('default options', () => {
      let app;

      beforeEach(() => {
        app = feathers()
          .configure(rest())
          .configure(hooks())
          .configure(authentication({
            facebook: {
              strategy: Strategy,
              clientID: 'client',
              clientSecret: 'secret'
            }
          }));
      });

      describe('common', () => {
        it('sets idField', () => {
          expect(app.get('auth').idField).to.equal('_id');
        });

        it('sets successRedirect', () => {
          expect(app.get('auth').successRedirect).to.equal('/auth/success');
        });

        it('sets failureRedirect', () => {
          expect(app.get('auth').failureRedirect).to.equal('/auth/failure');
        });

        it('sets tokenEndpoint', () => {
          expect(app.get('auth').tokenEndpoint).to.equal('/auth/token');
        });

        it('sets localEndpoint', () => {
          expect(app.get('auth').localEndpoint).to.equal('/auth/local');
        });      

        it('sets userEndpoint', () => {
          expect(app.get('auth').userEndpoint).to.equal('/users');
        });

        it('sets header', () => {
          expect(app.get('auth').header).to.equal('authorization');
        });

        it('sets cookie', () => {
          expect(app.get('auth').cookie).to.equal('feathers-jwt');
        });

        it('sets token', () => {
          expect(typeof app.get('auth').token).to.equal('object');
        });

        it('sets token secret', () => {
          expect(app.get('auth').token.secret).to.not.equal(undefined);
        });

        it('sets local', () => {
          expect(typeof app.get('auth').local).to.equal('object');
        });
      });

      describe('local', () => {
        let service;

        beforeEach(() => {
          service = app.service('auth/local');
        });

        it('gets configured', () => {
          expect(service).to.not.equal(undefined);
          expect(typeof service.options).to.equal('object');
        });

        it('sets usernameField', () => {
          expect(service.options.usernameField).to.equal('email');
        });

        it('sets passwordField', () => {
          expect(service.options.passwordField).to.equal('password');
        });

        it('has the common options', () => {
          expect(service.options.tokenEndpoint).to.equal('/auth/token');
          expect(service.options.userEndpoint).to.equal('/users');
        });
      });

      describe('token', () => {
        let service;

        beforeEach(() => {
          service = app.service('auth/token');
        });

        it('gets configured', () => {
          expect(service).to.not.equal(undefined);
          expect(typeof service.options).to.equal('object');
        });

        it('sets passwordField', () => {
          expect(service.options.passwordField).to.equal('password');
        });

        it('sets JWT issuer', () => {
          expect(service.options.issuer).to.equal('feathers');
        });

        it('sets JWT algorithm', () => {
          expect(service.options.algorithm).to.equal('HS256');
        });

        it('sets JWT expiresIn', () => {
          expect(service.options.expiresIn).to.equal('1d');
        });

        it('sets JWT payload', () => {
          expect(service.options.payload).to.deep.equal([]);
        });

        it('has the common options', () => {
          expect(service.options.idField).to.equal('_id');
          expect(service.options.userEndpoint).to.equal('/users');
        });
      });

      describe('OAuth2', () => {
        let service;

        beforeEach(() => {
          service = app.service('auth/facebook');
        });

        it('gets configured', () => {
          expect(service).to.not.equal(undefined);
          expect(typeof service.options).to.equal('object');
        });

        it('sets provider', () => {
          expect(service.options.provider).to.equal('facebook');
        });

        it('sets passReqToCallback', () => {
          expect(service.options.passReqToCallback).to.equal(true);
        });

        it('sets callbackSuffix', () => {
          expect(service.options.callbackSuffix).to.equal('callback');
        });

        it('sets permissions', () => {
          expect(typeof service.options.permissions).to.equal('object');
          expect(service.options.permissions.state).to.equal(true);
          expect(service.options.permissions.session).to.equal(false);
        });
      });
    });

    describe('custom options', () => {
      let app;

      beforeEach(() => {
        app = feathers()
          .configure(rest())
          .configure(hooks());
      });

      describe('common', () => {
        it('sets a custom property', () => {
          app.configure(authentication({ custom: true }));
          expect(app.get('auth').custom).to.equal(true);
        });

        it('allows overriding idField', () => {
          app.configure(authentication({ idField: 'id' }));
          expect(app.get('auth').idField).to.equal('id');
        });

        it('allows overriding successRedirect', () => {
          app.configure(authentication({ successRedirect: '/app' }));
          expect(app.get('auth').successRedirect).to.equal('/app');
        });

        it('allows overriding failureRedirect', () => {
          app.configure(authentication({ failureRedirect: '/login' }));
          expect(app.get('auth').failureRedirect).to.equal('/login');
        });

        it('allows disabling successRedirect', () => {
          app.configure(authentication({ successRedirect: false }));
          expect(app.get('auth').successRedirect).to.equal(false);
        });

        it('allows disabling failureRedirect', () => {
          app.configure(authentication({ failureRedirect: false }));
          expect(app.get('auth').failureRedirect).to.equal(false);
        });

        it('allows overriding tokenEndpoint', () => {
          app.configure(authentication({ tokenEndpoint: '/tokens' }));
          expect(app.get('auth').tokenEndpoint).to.equal('/tokens');
        });

        it('allows overriding localEndpoint', () => {
          app.configure(authentication({ localEndpoint: '/login' }));
          expect(app.get('auth').localEndpoint).to.equal('/login');
        });      

        it('allows overriding userEndpoint', () => {
          app.configure(authentication({ userEndpoint: '/api/users' }));
          expect(app.get('auth').userEndpoint).to.equal('/api/users');
        });

        it('allows overriding header', () => {
          app.configure(authentication({ header: 'x-authorization' }));
          expect(app.get('auth').header).to.equal('x-authorization');
        });

        it('allows overriding cookie', () => {
          app.configure(authentication({ cookie: 'my-cookie' }));
          expect(app.get('auth').cookie).to.equal('my-cookie');
        });

        it('allows overriding token', () => {
          app.configure(authentication({
            token: { custom: true }
          }));
          expect(typeof app.get('auth').token).to.equal('object');
          expect(app.get('auth').token.custom).to.equal(true);
        });

        it('setting custom token secret', () => {
          app.configure(authentication({
            token: { secret: 'secret' }
          }));
          expect(app.get('auth').token.secret).to.equal('secret');
        });

        it('allows overriding local', () => {
          app.configure(authentication({
            local: { custom: true }
          }));
          expect(typeof app.get('auth').local).to.equal('object');
          expect(app.get('auth').local.custom).to.equal(true);
        });
          
        it('throws an error when trying to set up a OAuth1 provider', () => {
          try {
            app.configure(authentication({
              fakeOAuth1: {
                consumerKey: 'key',
                consumerSecret: 'secret'
              }
            }));
          }
          catch (error) {
            expect(error).to.not.equal(undefined); 
          }
        });
      });

      describe('local', () => {
        it('allows overriding usernameField', () => {
          app.configure(authentication({
            local: { usernameField: 'username' }
          }));

          const service = app.service('auth/local');
          expect(service.options.usernameField).to.equal('username');
        });

        it('allows overriding passwordField', () => {
          app.configure(authentication({
            local: { passwordField: 'pass' }
          }));

          const service = app.service('auth/local');
          expect(service.options.passwordField).to.equal('pass');
        });

        it('allows overriding common options on a service level', () => {
          app.configure(authentication({
            local: { userEndpoint: '/api/users' }
          }));

          const service = app.service('auth/local');
          expect(service.options.userEndpoint).to.equal('/api/users');
        });

        it('has common overrides', () => {
          app.configure(authentication({ usernameField: 'username' }));

          const service = app.service('auth/local');
          expect(service.options.usernameField).to.equal('username');
        });
      });

      describe('token', () => {
        it('allows overriding passwordField', () => {
          app.configure(authentication({
            token: { passwordField: 'pass' }
          }));

          const service = app.service('auth/token');
          expect(service.options.passwordField).to.equal('pass');
        });

        it('allows overriding JWT issuer', () => {
          app.configure(authentication({
            token: { issuer: 'custom' }
          }));

          const service = app.service('auth/token');
          expect(service.options.issuer).to.equal('custom');
        });

        it('allows overriding JWT algorithm', () => {
          app.configure(authentication({
            token: { algorithm: 'HS512' }
          }));

          const service = app.service('auth/token');
          expect(service.options.algorithm).to.equal('HS512');
        });

        it('allows overriding JWT expiresIn', () => {
          app.configure(authentication({
            token: { expiresIn: '1m' }
          }));

          const service = app.service('auth/token');
          expect(service.options.expiresIn).to.equal('1m');
        });

        it('allows overriding JWT payload', () => {
          app.configure(authentication({
            token: { payload: ['name', 'email'] }
          }));

          const service = app.service('auth/token');
          expect(service.options.payload).to.deep.equal(['name', 'email']);
        });

        it('has common overrides', () => {
          app.configure(authentication({ usernameField: 'username' }));

          const service = app.service('auth/token');
          expect(service.options.usernameField).to.equal('username');
        });
      });

      describe('OAuth2', () => {
        it('allows overriding provider', () => {
          app.configure(authentication({
            facebook: {
              strategy: Strategy,
              clientID: 'client',
              clientSecret: 'secret',
              provider: 'custom'
            }
          }));

          const service = app.service('auth/facebook');
          expect(service.options.provider).to.equal('custom');
          expect(service.options.callbackURL).to.equal('/auth/facebook/callback');
        });

        it('allows overriding passReqToCallback', () => {
          app.configure(authentication({
            facebook: {
              strategy: Strategy,
              clientID: 'client',
              clientSecret: 'secret',
              passReqToCallback: false
            }
          }));

          const service = app.service('auth/facebook');
          expect(service.options.passReqToCallback).to.equal(false);
        });

        it('allows overriding callbackSuffix', () => {
          app.configure(authentication({
            facebook: {
              strategy: Strategy,
              clientID: 'client',
              clientSecret: 'secret',
              callbackSuffix: 'confirm'
            }
          }));

          const service = app.service('auth/facebook');
          expect(service.options.callbackSuffix).to.equal('confirm');
          expect(service.options.callbackURL).to.equal('/auth/facebook/confirm');
        });

        it('allows overriding endpoint', () => {
          app.configure(authentication({
            facebook: {
              strategy: Strategy,
              clientID: 'client',
              clientSecret: 'secret',
              endPoint: '/facebook'
            }
          }));

          const service = app.service('facebook');
          expect(service).to.not.equal(undefined);
          expect(service.options.endPoint).to.equal('/facebook');
          expect(service.options.callbackURL).to.equal('/facebook/callback');
        });

        it('allows overriding callbackURL', () => {
          app.configure(authentication({
            facebook: {
              strategy: Strategy,
              clientID: 'client',
              clientSecret: 'secret',
              callbackURL: '/auth/facebook/ok'
            }
          }));

          const service = app.service('auth/facebook');
          expect(service.options.callbackURL).to.equal('/auth/facebook/ok');
        });

        it('allows overriding permissions', () => {
          app.configure(authentication({
            facebook: {
              strategy: Strategy,
              clientID: 'client',
              clientSecret: 'secret',
              permissions: {
                authType: 'rerequest',
                session: true
              }
            }
          }));
          
          const service = app.service('auth/facebook');
          expect(service.options.permissions.authType).to.equal('rerequest');
          expect(service.options.permissions.session).to.equal(true);
        });

        it('retains default permissions that are not overridden', () => {
          app.configure(authentication({
            facebook: {
              strategy: Strategy,
              clientID: 'client',
              clientSecret: 'secret',
              permissions: {
                scope: ['public_profile', 'email']
              }
            }
          }));
          
          const service = app.service('auth/facebook');
          expect(service.options.permissions.scope).to.deep.equal(['public_profile', 'email']);
          expect(service.options.permissions.state).to.equal(true);
          expect(service.options.permissions.session).to.equal(false);
        });
      });
    });
  });
});