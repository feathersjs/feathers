const { promisify } = require('util');
const uuidv4 = require('uuid/v4');
const jsonwebtoken = require('jsonwebtoken');
const { merge, get } = require('lodash');
const { BadRequest } = require('@feathersjs/errors');

const debug = require('debug')('@feathersjs/authentication:service');

const createJWT = promisify(jsonwebtoken.sign);
const verifyJWT = promisify(jsonwebtoken.verify);

module.exports = class Service {
  constructor (app) {
    this.app = app;
  }

  createJWT (payload, options, _secret) {
    const { secret, jwt } = this.settings;
    const jwtSecret = _secret || secret;
    const jwtOptions = merge({}, jwt, options);

    if (!jwtOptions.jwtid) {
      jwtOptions.jwtid = uuidv4();
    }

    return createJWT(payload, jwtSecret, jwtOptions);
  }

  verifyJWT (accessToken, options, _secret) {
    const { secret, jwt } = this.settings;
    const jwtSecret = _secret || secret;
    const jwtOptions = merge({}, jwt, options);
    const { algorithm } = jwtOptions;

    if (algorithm) {
      jwtOptions.algorithms = Array.isArray(algorithm) ? algorithm : [ algorithm ];
      delete jwtOptions.algorithm;
    }

    return verifyJWT(accessToken, jwtSecret, jwtOptions);
  }

  get settings () {
    return merge({}, this.app.get('authentication'));
  }

  getEntity (accessToken) {
    const { entity, service } = this.settings;
    
    if (!entity || !service) {
      debug('No `entity` or `service` option found in configuration, returning null for getEntity');
      return Promise.resolve(null);
    }
    
    const entityService = this.app.service(service);

    return this.verifyJWT(accessToken).then(payload => {
      if (!payload.sub) {
        debug(`Token payload sub is not set, returning null for getEntity`, payload);
        return null;
      }
      
      return entityService.get(payload.sub);
    });
  }

  create (data, params) {
    const { service, entity, entityId } = this.settings;
    const payload = params.payload || {};
    const jwtOptions = merge({}, params.jwt);
    const hasEntity = service && entity && params[entity];

    // Set the subject to the entity id if it is available
    if (hasEntity && !jwtOptions.subject) {
      const { id = entityId } = this.app.service(service);
      const subject = get(params, [ entity, id ]);

      if (!subject) {
        return Promise.reject(
          new BadRequest(`Can not set valid JWT subject from params.${entity}.${id}`)
        );
      }

      jwtOptions.subject = subject;
    }

    debug('Creating JWT with', payload, jwtOptions);

    return this.createJWT(payload, jwtOptions, params.secret)
      .then(accessToken => ({ accessToken }));
  }

  remove (id, params) {
    const { authentication = {} } = params;
    const accessToken = id !== null ? id : authentication.accessToken;

    debug('Verifying JWT in remove');

    return this.verifyJWT(accessToken, params.jwt, params.secret)
      .then(() => ({ accessToken }));
  }

  setup () {
    const { secret, service, entity, entityId } = this.settings;

    if (typeof secret !== 'string') {
      throw new Error(`A 'secret' must be provided in your authentication configuration`);
    }

    if (entity !== null) {
      if (this.app.service(service) === undefined) {
        throw new Error(`The '${service}' entity service does not exist (set to 'null' if it is not required)`);
      }

      if (this.app.service(service).id === undefined && entityId === undefined) {
        throw new Error(`The '${service}' service does not have an 'id' property and no 'entityId' option is set.`);
      }
    }
  }
};
