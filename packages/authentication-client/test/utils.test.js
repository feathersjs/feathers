import { expect } from 'chai';
import { retrieveJWT, verifyJWT } from '../../src/client/utils';

const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZXhwIjozNDc2MzkyNDgwLCJpYXQiOjE0NzYzOTI0ODAsImlzcyI6ImZlYXRoZXJzIn0.0V6NKoNszBPeIA72xWs2FDW6aPxOnHzEmskulq20uyo';
const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJleHAiOjE0NzYzOTI0ODAsImlhdCI6MTQ3NjM5MjQ4MCwiaXNzIjoiZmVhdGhlcnMifQ.6rzpXFqWSmNEotnWo8f-SQ2Ey4rbar3f0pQKNTHdq9A';

describe('retrieveJWT', () => {
  it(`get unexpired token from storage`, () => {
    let storage = {
      getItem () {
        return Promise.resolve(validToken);
      }
    };
    retrieveJWT('feathers-jwt', 'feathers-jwt', storage).then(jwt => {
      expect(jwt).to.equal(validToken);
    });
  });

  it(`expired jwt returns undefined`, () => {
    let storage = {
      getItem () {
        return Promise.resolve(expiredToken);
      }
    };
    retrieveJWT('feathers-jwt', 'feathers-jwt', storage).then(jwt => {
      expect(jwt).to.equal(undefined);
    });
  });
});


describe('verifyJWT', () => {
  it('decodes a token string properly', () => {
    return verifyJWT(validToken).then(payload => {
      expect(payload).to.deep.equal({
        id: 1,
        exp: 3476392480,
        iat: 1476392480,
        iss: 'feathers'
      });
    });
  });

  it('decodes a token from an object properly', () => {
    let data = {
      token: validToken
    };
    return verifyJWT(data).then(payload => {
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
    return verifyJWT(token).catch(error => {
      expect(error instanceof Error).to.equal(true);
    });
  });

  it('throws an error with an expired token', () => {
    return verifyJWT(expiredToken).catch(error => {
      expect(error instanceof Error).to.equal(true);
    });
  });
});
