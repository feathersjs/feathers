import JWT from 'jsonwebtoken';
import feathers from 'feathers';
import memory from 'feathers-memory';
import authentication from 'feathers-authentication';
import jwt, { Verifier, ExtractJwt } from '../src';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import passportJWT from 'passport-jwt';

chai.use(sinonChai);

describe('feathers-authentication-jwt', () => {
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
    expect(typeof ExtractJwt.fromAuthHeader).to.equal('function');
    expect(typeof ExtractJwt.fromAuthHeaderWithScheme).to.equal('function');
    expect(typeof ExtractJwt.fromExtractors).to.equal('function');
  });

  describe('initialization', () => {
    let app;
    let validToken;
    let Payload = { id: 1 };

    beforeEach(done => {
      app = feathers();
      app.use('/users', memory());
      app.configure(authentication({ secret: 'supersecret' }));

      JWT.sign(Payload, 'supersecret', app.get('auth').jwt, (error, token) => {
        if (error) { return done(error); }
        validToken = token;
        done();
      });
    });

    it('throws an error if passport has not been registered', () => {
      expect(() => {
        feathers().configure(jwt());
      }).to.throw();
    });

    it('throws an error if header is not a string', () => {
      expect(() => {
        app.configure(jwt({ header: true }));
        app.setup();
      }).to.throw();
    });

    it('throws an error if secret is not a string', () => {
      expect(() => {
        app.configure(jwt({ secret: true }));
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

    describe('passport strategy options', () => {
      let authOptions;
      let args;

      beforeEach(() => {
        sinon.spy(passportJWT, 'Strategy');
        app.configure(jwt({ custom: true }));
        app.setup();
        authOptions = app.get('auth');
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
            expect(payload.id).to.equal(Payload.id);
            done(null, Payload);
          }
        }

        app.configure(jwt({ Verifier: CustomVerifier }));
        app.setup();

        return app.authenticate('jwt', { assignProperty: 'payload' })(req).then(result => {
          expect(result.data.payload.id).to.deep.equal(Payload.id);
        });
      });
    });
  });
});
