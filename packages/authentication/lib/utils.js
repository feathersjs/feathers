const { merge, pick, omit } = require('lodash');
const Debug = require('debug');
const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');

const debug = Debug('@feathersjs/authentication:authentication:utils');
const CREATE_VALID_KEYS = [
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
const VERIFY_VALID_KEYS = [
  'algorithms',
  'audience',
  'issuer',
  'ignoreExpiration',
  'ignoreNotBefore',
  'clockTolerance'
];

exports.createJWT = function createJWT (payload = {}, options = {}) {
  const settings = merge({}, options.jwt);
  const { secret } = options;

  if (!(payload.jti || settings.jwtid)) {
    settings.jwtid = uuidv4();
  }

  return new Promise((resolve, reject) => {
    debug('Creating JWT using options', settings);

    if (!secret) {
      return reject(new Error(`secret must provided`));
    }

    jwt.sign(omit(payload, CREATE_VALID_KEYS), secret, pick(settings, CREATE_VALID_KEYS), function (error, token) {
      if (error) {
        debug('Error signing JWT', error);
        return reject(error);
      }

      debug('New JWT issued with payload', payload);
      return resolve(token);
    });
  });
};

exports.verifyJWT = function verifyJWT (token, options = {}) {
  const settings = merge({}, options.jwt);
  const { secret } = options;

  // normalize algorithm to array
  if (settings.algorithm) {
    settings.algorithms = Array.isArray(settings.algorithm) ? settings.algorithm : [settings.algorithm];
    delete settings.algorithm;
  }

  return new Promise((resolve, reject) => {
    if (!token) {
      return reject(new Error(`Token must be provided`));
    }

    if (!secret) {
      return reject(new Error(`Secret must be provided`));
    }

    debug('Verifying token', token);
    jwt.verify(token, secret, pick(settings, VERIFY_VALID_KEYS), (error, payload) => {
      if (error) {
        debug('Error verifying token', error);
        return reject(error);
      }

      debug('Verified token with payload', payload);
      resolve(payload);
    });
  });
};
