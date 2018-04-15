const Debug = require('debug');
const bcrypt = require('bcryptjs');
const { get, omit } = require('lodash');

const debug = Debug('@feathersjs/authentication-local:verify');

class LocalVerifier {
  constructor (app, options = {}) {
    this.app = app;
    this.options = options;
    this.service = typeof options.service === 'string' ? app.service(options.service) : options.service;

    if (!this.service) {
      throw new Error(`options.service does not exist.\n\tMake sure you are passing a valid service path or service instance and it is initialized before @feathersjs/authentication-local.`);
    }

    this._comparePassword = this._comparePassword.bind(this);
    this._normalizeResult = this._normalizeResult.bind(this);
    this.verify = this.verify.bind(this);
  }

  _comparePassword (entity, password) {
    // select entity password field - take entityPasswordField over passwordField
    const passwordField = this.options.entityPasswordField || this.options.passwordField;

    // find password in entity, this allows for dot notation
    const hash = get(entity, passwordField);

    if (!hash) {
      return Promise.reject(new Error(`'${this.options.entity}' record in the database is missing a '${passwordField}'`));
    }

    debug('Verifying password');

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, hash, function (error, result) {
        // Handle 500 server error.
        if (error) {
          return reject(error);
        }

        if (!result) {
          debug('Password incorrect');
          return reject(false); // eslint-disable-line
        }

        debug('Password correct');
        return resolve(entity);
      });
    });
  }

  _normalizeResult (results) {
    // Paginated services return the array of results in the data attribute.
    let entities = results.data ? results.data : results;
    let entity = entities[0];

    // Handle bad username.
    if (!entity) {
      return Promise.reject(false); // eslint-disable-line
    }

    debug(`${this.options.entity} found`);
    return Promise.resolve(entity);
  }

  verify (req, username, password, done) {
    debug('Checking credentials', username, password);

    const id = this.service.id;
    const usernameField = this.options.entityUsernameField || this.options.usernameField;
    const params = Object.assign({
      'query': {
        [usernameField]: username,
        '$limit': 1
      }
    }, omit(req.params, 'query', 'provider', 'headers', 'session', 'cookies'));

    if (id === null || id === undefined) {
      debug('failed: the service.id was not set');
      return done(new Error('the `id` property must be set on the entity service for authentication'));
    }

    // Look up the entity
    this.service.find(params)
      .then(response => {
        const results = response.data || response;
        if (!results.length) {
          debug(`a record with ${usernameField} of '${username}' did not exist`);
        }
        return this._normalizeResult(response);
      })
      .then(entity => this._comparePassword(entity, password))
      .then(entity => {
        const id = entity[this.service.id];
        const payload = { [`${this.options.entity}Id`]: id };
        done(null, entity, payload);
      })
      .catch(error => error ? done(error) : done(null, error, { message: 'Invalid login' }));
  }
}

module.exports = LocalVerifier;
