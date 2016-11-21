import { expect } from 'chai';
import feathers from 'feathers/client';
import Passport from '../src/passport';
import auth from '../src';

const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZXhwIjozNDc2MzkyNDgwLCJpYXQiOjE0NzYzOTI0ODAsImlzcyI6ImZlYXRoZXJzIn0.0V6NKoNszBPeIA72xWs2FDW6aPxOnHzEmskulq20uyo';
const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJleHAiOjE0NzYzOTI0ODAsImlhdCI6MTQ3NjM5MjQ4MCwiaXNzIjoiZmVhdGhlcnMifQ.6rzpXFqWSmNEotnWo8f-SQ2Ey4rbar3f0pQKNTHdq9A';

describe('Passport', () => {
  let passport;
  let app;
  let options;

  before(() => {
    options = Object.assign({}, auth.defaults);
    app = feathers();
    passport = new Passport(app, options);
  });

  describe.skip('getJWT', () => {
    it(`get unexpired token from storage`, () => {
      let storage = {
        getItem () {
          return Promise.resolve(validToken);
        }
      };
      passport.getJWT('feathers-jwt', 'feathers-jwt', storage).then(jwt => {
        expect(jwt).to.equal(validToken);
      });
    });

    it(`expired jwt returns undefined`, () => {
      let storage = {
        getItem () {
          return Promise.resolve(expiredToken);
        }
      };
      passport.getJWT('feathers-jwt', 'feathers-jwt', storage).then(jwt => {
        expect(jwt).to.equal(undefined);
      });
    });
  });

  describe('verifyJWT', () => {
    it('returns an error when token is missing', () => {
      return passport.verifyJWT().catch(error => {
        expect(error instanceof Error).to.equal(true);
      });
    });

    it('returns an error token is not a string', () => {
      return passport.verifyJWT(true).catch(error => {
        expect(error instanceof Error).to.equal(true);
      });
    });

    it('decodes a token string properly', () => {
      return passport.verifyJWT(validToken).then(payload => {
        expect(payload).to.deep.equal({
          id: 1,
          exp: 3476392480,
          iat: 1476392480,
          iss: 'feathers'
        });
      });
    });

    it('gracefully handles an invalid token', () => {
      let token = `lily`;
      return passport.verifyJWT(token).catch(error => {
        expect(error instanceof Error).to.equal(true);
      });
    });

    it('returns an error with an expired token', () => {
      return passport.verifyJWT(expiredToken).catch(error => {
        expect(error instanceof Error).to.equal(true);
      });
    });
  });
});
