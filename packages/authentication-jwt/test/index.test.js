/* eslint-disable no-unused-expressions */
const JWT = require('jsonwebtoken');
const feathers = require('@feathersjs/feathers');
const expressify = require('@feathersjs/express');
const authentication = require('@feathersjs/authentication');
const memory = require('feathers-memory');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const passportJWT = require('passport-jwt');
const jwt = require('../lib');

const { Verifier, ExtractJwt } = jwt;
const { expect } = chai;

chai.use(sinonChai);

describe('@feathersjs/authentication-jwt', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../lib')).to.equal('function');
  });

  it('basic functionality', () => {
    expect(typeof jwt).to.equal('function');
  });

  it('exposes the Verifier class', () => {
    expect(typeof Verifier).to.equal('function');
    expect(typeof jwt.Verifier).to.equal('function');
  });

  it('exposes the passport-jwt ExtractJwt functions', () => {
    expect(typeof ExtractJwt).to.equal('object');
    expect(typeof jwt.ExtractJwt).to.equal('object');
    expect(typeof ExtractJwt.fromHeader).to.equal('function');
    expect(typeof ExtractJwt.fromBodyField).to.equal('function');
    expect(typeof ExtractJwt.fromUrlQueryParameter).to.equal('function');
    expect(typeof ExtractJwt.fromAuthHeaderWithScheme).to.equal('function');
    expect(typeof ExtractJwt.fromExtractors).to.equal('function');
  });

  describe('initialization', () => {
    let app;
    let validToken;
    let Payload = { userId: 1 };

    beforeEach(done => {
      app = expressify(feathers());
      app.use('/users', memory());
      app.configure(authentication({ secret: 'supersecret' }));

      JWT.sign(Payload, 'supersecret', app.get('authentication').jwt, (error, token) => {
        if (error) { return done(error); }
        validToken = token;
        done();
      });
    });

    it('throws an error if passport has not been registered', () => {
      expect(() => {
        expressify(feathers()).configure(jwt());
      }).to.throw();
    });

    it('throws an error if header is not a string', () => {
      expect(() => {
        app.configure(jwt({ header: true }));
        app.setup();
      }).to.throw();
    });

    it('throws an error if secret is not provided', () => {
      expect(() => {
        app = expressify(feathers());
        app.configure(authentication({}));
        app.setup();
      }).to.throw();
    });

    it('registers the jwt passport strategy', () => {
      sinon.spy(app.passport, 'use');
      sinon.spy(passportJWT, 'Strategy');
      app.configure(jwt());
      app.setup();

      expect(passportJWT.Strategy).to.have.been.calledOnce;
      expect(app.passport.use).to.have.been.calledWith('jwt');

      app.passport.use.restore();
      passportJWT.Strategy.restore();
    });

    it('registers the strategy options', () => {
      sinon.spy(app.passport, 'options');
      app.configure(jwt());
      app.setup();

      expect(app.passport.options).to.have.been.calledOnce;

      app.passport.options.restore();
    });

    describe('passport strategy options', () => {
      let authOptions;
      let args;

      beforeEach(() => {
        sinon.spy(passportJWT, 'Strategy');
        app.configure(jwt({ custom: true }));
        app.setup();
        authOptions = app.get('authentication');
        args = passportJWT.Strategy.getCall(0).args[0];
      });

      afterEach(() => {
        passportJWT.Strategy.restore();
      });

      it('sets secretOrKey', () => {
        expect(args.secretOrKey).to.equal('supersecret');
      });

      it('sets jwtFromRequest', () => {
        expect(args.jwtFromRequest).to.be.a('function');
      });

      it('sets session', () => {
        expect(args.session).to.equal(authOptions.session);
      });

      it('sets entity', () => {
        expect(args.entity).to.equal(authOptions.entity);
      });

      it('sets service', () => {
        expect(args.service).to.equal(authOptions.service);
      });

      it('sets passReqToCallback', () => {
        expect(args.passReqToCallback).to.equal(authOptions.passReqToCallback);
      });

      it('sets algorithms', () => {
        expect(args.algorithms).to.deep.equal([authOptions.jwt.algorithm]);
      });

      it('sets audience', () => {
        expect(args.audience).to.equal(authOptions.jwt.audience);
      });

      it('sets expiresIn', () => {
        expect(args.expiresIn).to.equal(authOptions.jwt.expiresIn);
      });

      it('sets issuer', () => {
        expect(args.issuer).to.equal(authOptions.jwt.issuer);
      });

      it('sets subject', () => {
        expect(args.subject).to.equal(authOptions.jwt.subject);
      });

      it('sets header', () => {
        expect(args.header).to.deep.equal(authOptions.jwt.header);
      });

      it('supports setting custom options', () => {
        expect(args.custom).to.equal(true);
      });
    });

    it('supports overriding default options', () => {
      sinon.spy(passportJWT, 'Strategy');
      app.configure(jwt({ subject: 'custom' }));
      app.setup();

      expect(passportJWT.Strategy.getCall(0).args[0].subject).to.equal('custom');

      passportJWT.Strategy.restore();
    });

    it('pulls options from global config with custom name', () => {
      sinon.spy(passportJWT, 'Strategy');
      let authOptions = app.get('authentication');
      authOptions.custom = { entity: 'device' };
      app.set('authentication', authOptions);

      app.configure(jwt({ name: 'custom' }));
      app.setup();

      expect(passportJWT.Strategy.getCall(0).args[0].entity).to.equal('device');
      expect(passportJWT.Strategy.getCall(0).args[0].bodyKey).to.equal('accessToken');

      passportJWT.Strategy.restore();
    });

    describe('Bearer scheme', () => {
      it('authenticates using the default verifier', () => {
        const req = {
          query: {},
          body: {},
          headers: {
            authorization: `Bearer ${validToken}`
          },
          cookies: {}
        };

        app.configure(jwt());
        app.setup();

        return app.authenticate('jwt')(req).then(result => {
          expect(result.success).to.equal(true);
        });
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

          app.configure(jwt({ Verifier: CustomVerifier }));
          app.setup();
        }).to.throw();
      });

      it('verifies through custom verify function', () => {
        const req = {
          query: {},
          body: {},
          headers: {
            authorization: `${validToken}`
          },
          cookies: {}
        };
        class CustomVerifier extends Verifier {
          verify (req, payload, done) {
            expect(payload.userId).to.equal(Payload.userId);
            done(null, payload, Payload);
          }
        }

        app.configure(jwt({ Verifier: CustomVerifier }));
        app.setup();

        return app.authenticate('jwt')(req).then(result => {
          expect(result.data.payload.userId).to.deep.equal(Payload.userId);
        });
      });
    });
  });
});
