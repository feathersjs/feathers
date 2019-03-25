const { merge, get } = require('lodash');
const AuthenticationCore = require('./core');
const { NotAuthenticated } = require('@feathersjs/errors');
const debug = require('debug')('@feathersjs/authentication/service');
const { connection, events } = require('./hooks');

module.exports = class AuthenticationService extends AuthenticationCore {
  getPayload (authResult, params) {
    // Uses `params.payload` or returns an empty payload
    const { payload = {} } = params;

    return Promise.resolve(payload);
  }

  getJwtOptions (authResult, params) {
    const { service, entity, entityId } = this.configuration;
    const jwtOptions = merge({}, params.jwt);
    const hasEntity = service && entity && authResult[entity];

    // Set the subject to the entity id if it is available
    if (hasEntity && !jwtOptions.subject) {
      const idProperty = entityId || this.app.service(service).id;
      const subject = get(authResult, [ entity, idProperty ]);

      if (subject === undefined) {
        return Promise.reject(
          new NotAuthenticated(`Can not set subject from ${entity}.${idProperty}`)
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
          .then(accessToken => Object.assign({}, { accessToken }, authResult));
      });
  }

  remove (id, params) {
    const { authentication } = params;
    const { strategies = [] } = this.configuration;

    // When an id is passed it is expected to be the authentication `accessToken`
    if (id !== null && id !== authentication.accessToken) {
      return Promise.reject(
        new NotAuthenticated('Invalid access token')
      );
    }

    debug('Verifying authentication strategy in remove');

    return this.authenticate(authentication, params, ...strategies);
  }

  setup (app, path) {
    // The setup method checks for valid settings and registers the
    // connection and event (login, logout) hooks
    const { secret, service, entity, entityId, strategies } = this.configuration;

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

    if (strategies.length === 0) {
      throw new Error(`At least one valid authentication strategy required in '${this.configKey}.strategies'`);
    }

    this.hooks({
      after: [ connection(), events() ]
    });
  }
};
