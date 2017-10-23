import jwt from 'jsonwebtoken';
import chai, { expect } from 'chai';
import chaiUuid from 'chai-uuid';
import { createJWT, verifyJWT } from '../src/utils';
import getOptions from '../src/options';

chai.use(chaiUuid);

describe('utils', () => {
  let options;
  let payload;

  beforeEach(() => {
    options = getOptions({
      secret: 'supersecret'
    });

    payload = { id: 1 };
  });

  describe('createJWT', () => {
    describe('when secret is undefined', () => {
      it('returns an error', () => {
        return createJWT().catch(error => {
          expect(error).to.not.equal(undefined);
        });
      });
    });

    describe('when using default options', () => {
      let token;
      let decoded;

      beforeEach(() => {
        return createJWT(payload, options).then(t => {
          token = t;
          decoded = jwt.decode(token);
        });
      });

      it('returns a JWT', () => {
        expect(token).not.equal(undefined);
      });

      it('encodes the payload', () => {
        expect(decoded.id).to.deep.equal(payload.id);
      });

      it('has the correct audience', () => {
        expect(decoded.aud).to.equal(options.jwt.audience);
      });

      it('has the correct subject', () => {
        expect(decoded.sub).to.equal(options.jwt.subject);
      });

      it('has the correct issuer', () => {
        expect(decoded.iss).to.equal(options.jwt.issuer);
      });

      it('has a uuidv4 jwtid', () => {
        expect(decoded.jti).to.be.a.uuid('v4');
      });
    });

    describe('when passing custom options', () => {
      let token;
      let decoded;

      beforeEach(() => {
        options.jwt.subject = 'refresh';
        options.jwt.issuer = 'custom';
        options.jwt.audience = 'org';
        options.jwt.expiresIn = '1y'; // expires in 1 year
        options.jwt.notBefore = '1h'; // token is valid 1 hour from now
        options.jwt.jwtid = '1234';

        return createJWT(payload, options).then(t => {
          token = t;
          decoded = jwt.decode(token);
        });
      });

      it('returns a JWT', () => {
        expect(token).not.equal(undefined);
      });

      it('encodes the payload', () => {
        expect(decoded.id).to.deep.equal(payload.id);
      });

      it('has the correct audience', () => {
        expect(decoded.aud).to.equal('org');
      });

      it('has the correct subject', () => {
        expect(decoded.sub).to.equal('refresh');
      });

      it('has the correct issuer', () => {
        expect(decoded.iss).to.equal('custom');
      });

      it('has the correct jwtid', () => {
        expect(decoded.jti).to.equal('1234');
      });
    });
  });

  describe('verifyJWT', () => {
    let validToken;
    let expiredToken;

    beforeEach(() => {
      return createJWT(payload, options).then(vt => {
        validToken = vt;
        options.jwt.expiresIn = '1ms';

        return createJWT(payload, options).then(et => {
          expiredToken = et;
        });
      });
    });

    describe('when secret is undefined', () => {
      it('returns an error', () => {
        return verifyJWT().catch(error => {
          expect(error).to.not.equal(undefined);
        });
      });
    });

    describe('when using default options', () => {
      describe('when token is valid', () => {
        it('returns payload', () => {
          return verifyJWT(validToken, options).then(payload => {
            expect(payload.id).to.equal(1);
          });
        });
      });

      describe('when token is expired', () => {
        it('returns an error', () => {
          return verifyJWT(expiredToken, options).catch(error => {
            expect(error).to.not.equal(undefined);
          });
        });
      });

      describe('when token is invalid', () => {
        it('returns payload', () => {
          return verifyJWT('invalid', options).catch(error => {
            expect(error).to.not.equal(undefined);
          });
        });
      });
    });

    describe('when using custom options', () => {
      describe('when secret does not match', () => {
        it('returns an error', () => {
          options.secret = 'invalid';
          return verifyJWT(validToken, options).catch(error => {
            expect(error).to.not.equal(undefined);
          });
        });
      });

      describe('when audience does not match', () => {
        it('returns an error', () => {
          options.jwt.audience = 'invalid';
          return verifyJWT(validToken, options).catch(error => {
            expect(error).to.not.equal(undefined);
          });
        });
      });

      describe('when subject does not match', () => {
        it('returns an error', () => {
          options.jwt.subject = 'invalid';
          return verifyJWT(validToken, options).catch(error => {
            expect(error).to.not.equal(undefined);
          });
        });
      });

      describe('when issuer does not match', () => {
        it('returns an error', () => {
          options.jwt.issuer = 'invalid';
          return verifyJWT(validToken, options).catch(error => {
            expect(error).to.not.equal(undefined);
          });
        });
      });

      describe('when algorithm does not match', () => {
        it('returns an error', () => {
          options.jwt.algorithm = 'HS512';
          return verifyJWT(validToken, options).catch(error => {
            expect(error).to.not.equal(undefined);
          });
        });
      });
    });
  });
});
