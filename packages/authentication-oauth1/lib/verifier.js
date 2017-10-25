const Debug = require('debug');

const debug = Debug('@feathersjs/authentication-oauth1:verify');

class OAuth1Vierifier {
  constructor (app, options = {}) {
    this.app = app;
    this.options = options;
    this.service = typeof options.service === 'string' ? app.service(options.service) : options.service;

    if (!this.service) {
      throw new Error(`options.service does not exist.\n\tMake sure you are passing a valid service path or service instance and it is initialized before @feathersjs/authentication-oauth1.`);
    }

    this._createEntity = this._createEntity.bind(this);
    this._updateEntity = this._updateEntity.bind(this);
    this._normalizeResult = this._normalizeResult.bind(this);
    this.verify = this.verify.bind(this);
  }

  _normalizeResult (results) {
    // Paginated services return the array of results in the data attribute.
    let entities = results.data ? results.data : results;
    let entity = entities[0];

    // Handle entity not found.
    if (!entity) {
      return Promise.resolve(null);
    }

    // Handle updating mongoose models
    if (typeof entity.toObject === 'function') {
      entity = entity.toObject();
    } else if (typeof entity.toJSON === 'function') {
      // Handle updating Sequelize models
      entity = entity.toJSON();
    }

    debug(`${this.options.entity} found`);
    return Promise.resolve(entity);
  }

  _updateEntity (entity, data) {
    const options = this.options;
    const name = options.name;
    const id = entity[this.service.id];
    debug(`Updating ${options.entity}: ${id}`);

    const newData = {
      [options.idField]: data.profile.id,
      [name]: data
    };

    return this.service.patch(id, newData, { oauth: { provider: name } });
  }

  _createEntity (data) {
    const options = this.options;
    const name = options.name;
    const entity = {
      [options.idField]: data.profile.id,
      [name]: data
    };

    const id = entity[options.idField];
    debug(`Creating new ${options.entity} with ${options.idField}: ${id}`);

    return this.service.create(entity, { oauth: { provider: name } });
  }

  verify (req, accessToken, refreshToken, profile, done) {
    debug('Checking credentials');
    const options = this.options;
    const query = {
      [options.idField]: profile.id, // facebookId: profile.id
      $limit: 1
    };
    const data = { profile, accessToken, refreshToken };
    let existing;

    if (this.service.id === null || this.service.id === undefined) {
      debug('failed: the service.id was not set');
      return done(new Error('the `id` property must be set on the entity service for authentication'));
    }

    // Check request object for an existing entity
    if (req && req[options.entity]) {
      existing = req[options.entity];
    }

    // Check the request that came from a hook for an existing entity
    if (!existing && req && req.params && req.params[options.entity]) {
      existing = req.params[options.entity];
    }

    // If there is already an entity on the request object (ie. they are
    // already authenticated) attach the profile to the existing entity
    // because they are likely "linking" social accounts/profiles.
    if (existing) {
      return this._updateEntity(existing, data)
        .then(entity => done(null, entity))
        .catch(error => error ? done(error) : done(null, error));
    }

    // Find or create the user since they could have signed up via facebook.
    this.service
      .find({ query })
      .then(this._normalizeResult)
      .then(entity => entity ? this._updateEntity(entity, data) : this._createEntity(data))
      .then(entity => {
        const id = entity[this.service.id];
        const payload = { [`${this.options.entity}Id`]: id };
        done(null, entity, payload);
      })
      .catch(error => error ? done(error) : done(null, error));
  }
}

module.exports = OAuth1Vierifier;
