const bcrypt = require('bcryptjs');
const { NotAuthenticated } = require('@feathersjs/errors');
const { get, omit } = require('lodash');

const debug = require('debug')('@feathersjs/authentication-local/strategy');

module.exports = class LocalStrategy {
  setAuthentication (auth) {
    this.authentication = auth;
  }

  setApplication (app) {
    this.app = app;
  }

  setName (name) {
    this.name = name;
  }

  get configuration () {
    const authConfig = this.authentication.configuration;
    const config = authConfig[this.name];

    return Object.assign({}, {
      hashSize: 10,
      service: authConfig.service,
      entity: authConfig.entity,
      errorMessage: 'Invalid login',
      entityPasswordField: config.passwordField,
      entityUsernameField: config.usernameField
    }, config);
  }

  getEntityQuery (query) {
    return Promise.resolve(Object.assign({
      $limit: 1
    }, query));
  }

  findEntity (username, params) {
    const { entityUsernameField, service, errorMessage } = this.configuration;

    return this.getEntityQuery({
      [entityUsernameField]: username
    }, params).then(query => {
      const findParams = Object.assign(omit(params, 'provider'), { query });
      const entityService = this.app.service(service);

      debug('Finding entity with query', params.query);

      return entityService.find(findParams);
    }).then(result => {
      const list = Array.isArray(result) ? result : (result.data || []);

      if (list.length === 0) {
        debug(`No entity found`);

        return Promise.reject(new NotAuthenticated(errorMessage));
      }

      const [ entity ] = list;

      return entity;
    });
  }

  comparePassword (entity, password) {
    const { entityPasswordField, errorMessage } = this.configuration;
    // find password in entity, this allows for dot notation
    const hash = get(entity, entityPasswordField);

    if (!hash) {
      debug(`Record is missing the '${entityPasswordField}' password field`);

      return Promise.reject(new NotAuthenticated(errorMessage));
    }

    debug('Verifying password');

    return bcrypt.compare(password, hash).then(result => {
      if (result) {
        return entity;
      }

      throw new NotAuthenticated(errorMessage);
    });
  }

  hashPassword (password) {
    return bcrypt.hash(password, this.configuration.hashSize);
  }

  authenticate (data, params) {
    const { passwordField, usernameField, entity, errorMessage } = this.configuration;
    const username = data[usernameField];
    const password = data[passwordField];

    if (data.strategy && data.strategy !== this.name) {
      return Promise.reject(new NotAuthenticated(errorMessage));
    }

    return this.findEntity(username, params)
      .then(entity => this.comparePassword(entity, password))
      .then(authEntity => {
        return {
          authentication: { strategy: this.name },
          [entity]: authEntity
        };
      });
  }
};
