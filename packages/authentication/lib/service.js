const { merge, get } = require('lodash');
const AuthenticationBase = require('./base');
const { NotAuthenticated } = require('@feathersjs/errors');
const debug = require('debug')('@feathersjs/authentication/service');
const { connection, events } = require('./hooks');

module.exports = class AuthenticationService extends AuthenticationBase {
  create (data, params) {
    const { service, entity, entityId } = this.configuration;
    const payload = params.payload || {};
    const jwtOptions = merge({}, params.jwt);
    const hasEntity = service && entity && params[entity];

    // Set the subject to the entity id if it is available
    if (hasEntity && !jwtOptions.subject) {
      const { id = entityId } = this.app.service(service);
      const subject = get(params, [ entity, id ]);

      if (!subject) {
        return Promise.reject(
          new NotAuthenticated(`Can not set subject from params.${entity}.${id}`)
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

    this.configuration.path = path;
    this.hooks({
      after: [ connection(), events() ]
    });
  }
};
