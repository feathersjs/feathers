const { merge, get } = require('lodash');
const AuthenticationBase = require('./base');
const { NotAuthenticated } = require('@feathersjs/errors');
const debug = require('debug')('@feathersjs/authentication/service');
const { connection, events } = require('./hooks');

module.exports = class AuthenticationService extends AuthenticationBase {
  getPayload (authResult, params) {
    const { payload = {} } = params;

    return Promise.resolve(payload);
  }

  getJwtOptions (authResult, params) {
    const { service, entity, entityId } = this.configuration;
    const jwtOptions = merge({}, params.jwt);
    const hasEntity = service && entity && authResult[entity];

    // Set the subject to the entity id if it is available
    if (hasEntity && !jwtOptions.subject) {
      const { id = entityId } = this.app.service(service);
      const subject = get(authResult, [ entity, id ]);

      if (!subject) {
        return Promise.reject(
          new NotAuthenticated(`Can not set subject from ${entity}.${id}`)
        );
      }

      jwtOptions.subject = `${subject}`;
    }

    return Promise.resolve(jwtOptions);
  }

  create (data, params) {
    const { strategies = [] } = this.configuration;

    if (!strategies.length) {
      return Promise.reject(
        new NotAuthenticated('No authentication strategies allowed for creating a JWT')
      );
    }

    return this.authenticate(data, params, ...strategies)
      .then(authResult => {
        debug('Got authentication result', authResult);

        return Promise.all([
          authResult,
          this.getPayload(authResult, params),
          this.getJwtOptions(authResult, params)
        ]);
      }).then(([ authResult, payload, jwtOptions ]) => {
        debug('Creating JWT with', payload, jwtOptions);

        return this.createJWT(payload, jwtOptions, params.secret)
          .then(accessToken => Object.assign({}, authResult, { accessToken }));
      });
  }

  remove (id, params) {
    const { authentication = {} } = params;
    const accessToken = id !== null ? id : authentication.accessToken;

    debug('Verifying JWT in remove');

    return this.verifyJWT(accessToken, params.jwt, params.secret)
      .then(() => ({ accessToken }));
  }

  setup (app, path) {
    const { secret, service, entity, entityId } = this.configuration;

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
    
    this.hooks({
      after: [ connection(), events() ]
    });
  }
};
