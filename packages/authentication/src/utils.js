import Debug from 'debug';
import pick from 'lodash.pick';
import omit from 'lodash.omit';
import jwt from 'jsonwebtoken';

const debug = Debug('feathers-authentication:authentication:utils');

export function createJWT (payload = {}, options = {}) {
  const VALID_KEYS = [
    'algorithm',
    'expiresIn',
    'notBefore',
    'audience',
    'issuer',
    'jwtid',
    'subject',
    'noTimestamp',
    'header',
    'exp',
    'nbf',
    'aud',
    'sub',
    'iss'
  ];
  const settings = Object.assign({}, options.jwt);
  const { secret } = options;

  return new Promise((resolve, reject) => {
    debug('Creating JWT using options', settings);

    if (!secret) {
      return reject(new Error(`secret must provided`));
    }

    // TODO (EK): Support jwtids. Maybe auto-generate a uuid
    jwt.sign(omit(payload, VALID_KEYS), secret, pick(settings, VALID_KEYS), function (error, token) {
      if (error) {
        debug('Error signing JWT', error);
        return reject(error);
      }

      debug('New JWT issued with payload', payload);
      return resolve(token);
    });
  });
}

export function verifyJWT (token, options = {}) {
  const VALID_KEYS = [
    'algorithms',
    'audience',
    'issuer',
    'ignoreExpiration',
    'ignoreNotBefore',
    'subject',
    'clockTolerance'
  ];
  const settings = Object.assign({}, options.jwt);
  const { secret } = options;

  // normalize algorithm to array
  if (settings.algorithm) {
    settings.algorithms = Array.isArray(settings.algorithm) ? settings.algorithm : [settings.algorithm];
    delete settings.algorithm;
  }

  return new Promise((resolve, reject) => {
    if (!token) {
      return reject(new Error(`token must provided`));
    }

    if (!secret) {
      return reject(new Error(`secret must provided`));
    }

    debug('Verifying token', token);
    jwt.verify(token, secret, pick(settings, VALID_KEYS), (error, payload) => {
      if (error) {
        debug('Error verifying token', error);
        return reject(error);
      }

      debug('Verified token with payload', payload);
      resolve(payload);
    });
  });
}
