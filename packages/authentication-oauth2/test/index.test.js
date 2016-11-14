import feathers from 'feathers';
import memory from 'feathers-memory';
import authentication from 'feathers-authentication';
import oauth2, { url, Verifier } from '../src';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Strategy from './fixtures/strategy';

chai.use(sinonChai);

describe('feathers-authentication-oauth2', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../lib')).to.equal('function');
  });

  it('basic functionality', () => {
    expect(typeof oauth2).to.equal('function');
  });

  it('exposes the Verifier class', () => {
    expect(typeof Verifier).to.equal('function');
    expect(typeof oauth2.Verifier).to.equal('function');
  });

  it('exposes url utility function', () => {
    expect(typeof url).to.equal('function');
    expect(typeof oauth2.url).to.equal('function');
  });

  describe('initialization', () => {
    let app;
    let config;

    beforeEach(() => {
      config = {
        name: 'github',
        Strategy,
        clientID: '1234',
        clientSecret: 'secret'
      };

      app = feathers();
      app.set('host', 'localhost');
      app.set('port', 3030);
      app.use('/users', memory());
      app.configure(authentication({ secret: 'supersecret' }));
    });

    it('throws an error if passport has not been registered', () => {
      expect(() => {
        feathers().configure(oauth2());
      }).to.throw();
    });

    it('throws an error if strategy name is missing', () => {
      expect(() => {
        delete config.name;
        app.configure(oauth2(config));
      }).to.throw();
    });

    it('throws an error if Strategy is missing', () => {
      expect(() => {
        delete config.Strategy;
        app.configure(oauth2(config));
      }).to.throw();
    });

    it('throws an error if clientID is missing', () => {
      expect(() => {
        delete config.clientID;
        app.configure(oauth2(config));
      }).to.throw();
    });

    it('throws an error if clientSecret is missing', () => {
      expect(() => {
        delete config.clientSecret;
        app.configure(oauth2(config));
      }).to.throw();
    });

    it('registers the oauth2 passport strategy', () => {
      sinon.spy(app.passport, 'use');
      sinon.spy(config, 'Strategy');
      app.configure(oauth2(config));
      app.setup();

      expect(config.Strategy).to.have.been.calledOnce;
      expect(app.passport.use).to.have.been.calledWith(config.name);

      app.passport.use.restore();
      config.Strategy.restore();
    });

    describe('passport strategy options', () => {
      let authOptions;
      let args;

      beforeEach(() => {
        config.custom = true;
        sinon.spy(config, 'Strategy');
        app.configure(oauth2(config));
        app.setup();
        authOptions = app.get('auth');
        args = config.Strategy.getCall(0).args[0];
      });

      afterEach(() => {
        config.Strategy.restore();
      });

      it('sets path', () => {
        expect(args.path).to.equal(`/auth/${config.name}`);
      });

      it('sets callbackURL', () => {
        expect(args.callbackURL).to.equal(`http://localhost:3030/auth/${config.name}/callback`);
      });

      it('sets idField', () => {
        expect(args.idField).to.equal(`${config.name}Id`);
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
      sinon.spy(config, 'Strategy');
      config.entity = 'organization';
      app.configure(oauth2(config));
      app.setup();

      expect(config.Strategy.getCall(0).args[0].entity).to.equal('organization');
      
      config.Strategy.restore();
    });

    it('registers express get route', () => {
      sinon.spy(app, 'get');
      app.configure(oauth2(config));
      app.setup();

      expect(app.get).to.have.been.calledWith(`/auth/${config.name}`);

      app.get.restore();
    });

    it('registers express callback route', () => {
      sinon.spy(app, 'get');
      app.configure(oauth2(config));
      app.setup();

      expect(app.get).to.have.been.calledWith(`/auth/${config.name}/callback`);

      app.get.restore();
    });

    describe('custom Verifier', () => {
      it('throws an error if a verify function is missing', () => {
        expect(() => {
          class CustomVerifier {
            constructor (app) {
              this.app = app;
            }
          }
          config.Verifier = CustomVerifier;
          app.configure(oauth2(config));
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
          verify (req, accessToken, refreshToken, profile, done) {
            expect(accessToken).to.equal('mockAccessToken');
            expect(refreshToken).to.equal('mockRefreshToken');
            expect(profile).to.deep.equal({ name: 'Mocky Mockerson' });
            done(null, User);
          }
        }

        config.Verifier = CustomVerifier;
        app.configure(oauth2(config));
        app.setup();

        return app.authenticate('github')(req).then(result => {
          expect(result.data.user).to.deep.equal(User);
        });
      });
    });
  });
});
