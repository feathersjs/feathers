const assert = require('assert');
const jwt = require('jsonwebtoken');
const { omit } = require('lodash');

const { createJWT, verifyJWT } = require('../lib/utils');
const getOptions = require('../lib/options');
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

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
    it('does not error if payload has jti property', () => {
      return createJWT({
        id: 1,
        jti: 'test'
      }, options).then(t => {
        const decoded = jwt.decode(t);

        assert.equal(decoded.jti, 'test');
      });
    });

    describe('using default options', () => {
      let token;
      let decoded;

      beforeEach(() => {
        return createJWT(payload, options).then(t => {
          token = t;
          decoded = jwt.decode(token);
        });
      });

      it('returns a JWT', () => {
        assert.ok(token);
      });

      it('decodes the token', () => {
        assert.equal(decoded.id, payload.id);
        assert.equal(decoded.aud, options.jwt.audience);
        assert.equal(decoded.sub, options.jwt.subject);
        assert.equal(decoded.iss, options.jwt.issuer);
        assert.ok(decoded.jti);
        assert.ok(UUID.test(decoded.jti));
      });
    });

    describe('passing custom options', () => {
      let token;
      let decoded;

      beforeEach(() => {
        Object.assign(options.jwt, {
          subject: 'refresh',
          issuer: 'custom',
          audience: 'org',
          expiresIn: '1y', // expires in 1 year
          notBefore: '1h', // token is valid 1 hour from now
          jwtid: '1234'
        });

        return createJWT(payload, options).then(t => {
          token = t;
          decoded = jwt.decode(token);
        });
      });

      it('returns a JWT', () => {
        assert.ok(token);
      });

      it('decoded the token', () => {
        assert.equal(decoded.id, payload.id);
        assert.equal(decoded.aud, 'org');
        assert.equal(decoded.sub, 'refresh');
        assert.equal(decoded.iss, 'custom');
        assert.equal(decoded.jti, '1234');
      });
    });

    describe('errors', () => {
      it('returns an error when secret is undefined', () => {
        return createJWT().catch(error => assert.ok(error));
      });

      it('errors with invalid settings', () => {
        options.jwt.algorithm = 'jkflsd';

        return createJWT(payload, options)
          .then(() => assert.fail('Should never get here'))
          .catch(error => {
            assert.equal(error.message, '"algorithm" must be a valid string enum value');
          });
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

    it('returns an error when secret is undefined', () => {
      return verifyJWT().then(() => assert.fail('Should never get here'))
        .catch(error => assert.equal(error.message, 'Token must be provided'));
    });

    describe('when using default options', () => {
      it('returns payload when token is valid', () => {
        return verifyJWT(validToken, options).then(payload => {
          assert.equal(payload.id, 1);
        });
      });

      it('errors when no secret is provided', () => {
        return verifyJWT(expiredToken, omit(options, 'secret'))
          .then(() => assert.fail('Should never get here'))
          .catch(error => {
            assert.equal(error.message, 'Secret must be provided');
          });
      });

      it('errors when token is expired', () => {
        return verifyJWT(expiredToken, options)
          .then(() => assert.fail('Should never get here'))
          .catch(error => {
            assert.equal(error.message, 'jwt expired');
          });
      });

      it('errors when token is invalid', () => {
        return verifyJWT('invalid', options)
          .then(() => assert.fail('Should never get here'))
          .catch(error => {
            assert.equal(error.message, 'jwt malformed');
          });
      });
    });

    describe('when using custom options', () => {
      it('returns an error when secret does not match', () => {
        options.secret = 'invalid';
        return verifyJWT(validToken, options)
          .then(() => assert.fail('Should never get here'))
          .catch(error => {
            assert.equal(error.message, 'invalid signature');
          });
      });

      it('returns an error', () => {
        options.jwt.audience = 'invalid';
        return verifyJWT(validToken, options)
          .then(() => assert.fail('Should never get here'))
          .catch(error => {
            assert.equal(error.message, 'jwt audience invalid. expected: invalid');
          });
      });

      it('returns an error when issuer does not match', () => {
        options.jwt.issuer = 'invalid';
        return verifyJWT(validToken, options)
          .then(() => assert.fail('Should never get here'))
          .catch(error => {
            assert.equal(error.message, 'jwt issuer invalid. expected: invalid');
          });
      });

      it('returns an error when algorithm does not match', () => {
        delete options.jwt.algorithm;
        options.jwt.algorithms = [ 'HS512' ];
        return verifyJWT(validToken, options)
          .then(() => assert.fail('Should never get here'))
          .catch(error => {
            assert.equal(error.message, 'invalid algorithm');
          });
      });
    });
  });
});
