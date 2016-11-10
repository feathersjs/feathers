import JWT from 'jsonwebtoken';
import feathers from 'feathers';
import memory from 'feathers-memory';
import authentication from 'feathers-authentication';
import jwt, { Verifier, ExtractJwt } from '../src';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

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
      }).to.throw();
    });

    it('registers the jwt passport strategy', () => {
      sinon.spy(app.passport, 'use');
      app.configure(jwt());
      expect(app.passport.use).to.have.been.calledWith('jwt');
      app.passport.use.restore();
    });

    describe('custom Verifier', () => {
      it('throws an error if a verify function is missing', () => {
        expect(() => {
          app.configure(jwt({ Verifier: {} }));
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

        return app.authenticate('jwt', { assignProperty: 'payload' })(req).then(result => {
          expect(result.data.payload.id).to.deep.equal(Payload.id);
        });
      });
    });

    describe('default options', () => {
      let options;
      before(() => {
        app.configure(jwt());
        options = app.get('auth').jwt;
      });

      it('sets options back onto global auth config', () => {
        expect(options).to.not.equal(undefined);
      });

      it('sets the name', () => {
        expect(options.name).to.equal('jwt');
      });

      it('sets the entity', () => {
        expect(options.entity).to.equal('user');
      });

      it('sets the service', () => {
        expect(options.service).to.equal('users');
      });

      it('sets passReqToCallback', () => {
        expect(options.passReqToCallback).to.equal(true);
      });

      it('disables sessions', () => {
        expect(options.session).to.equal(false);
      });

      describe('when secret is in global auth config', () => {
      });
    });
  });
});
