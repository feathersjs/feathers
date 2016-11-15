import Debug from 'debug';
import errors from 'feathers-errors';
import bcrypt from 'bcryptjs';

const debug = Debug('feathers-authentication-local:verify');

class LocalVerifier {
  constructor(app, options = {}) {
    this.app = app;
    this.options = options;
    this.service = typeof options.service === 'string' ? app.service(options.service) : options.service;

    if (!this.service) {
      throw new Error(`options.service does not exist.\n\tMake sure you are passing a valid service path or service instance and it is initialized before feathers-authentication-local.`);
    }

    this.comparePassword = this.comparePassword.bind(this);
    this.normalizeResult = this.normalizeResult.bind(this);
    this.verify = this.verify.bind(this);
  }

  comparePassword(entity, password) {
    const hash = entity[this.options.passwordField];

    if (!hash) {
      return Promise.reject(new Error(`'${this.options.entity}' record in the database is missing a '${this.options.passwordField}'`));
    }

    debug('Verifying password');
    
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, hash, function(error, result) {
        // Handle 500 server error.
        if (error) {
          return reject(error);
        }

        if (!result) {
          debug('Password incorrect');
          return reject(false);
        }

        debug('Password correct');
        return resolve(entity);
      });
    });
  }

  normalizeResult(results) {
    // Paginated services return the array of results in the data attribute.
    let entities = results.data ? results.data : results;
    let entity = entities[0];

    // Handle bad username.
    if (!entity) {
      return Promise.reject(false);
    }

    debug(`${this.options.entity} found`);
    return Promise.resolve(entity);
  }

  verify(req, username, password, done) {
    debug('Checking credentials', username, password);
    const query = {
      [this.options.usernameField]: username,
      $limit: 1
    };

    // Look up the entity
    this.service.find({ query })
      .then(this.normalizeResult)
      .then(entity => this.comparePassword(entity, password))
      .then(entity => done(null, entity))
      .catch(error => error ? done(error) : done(null, error));
  }
}

export default LocalVerifier;