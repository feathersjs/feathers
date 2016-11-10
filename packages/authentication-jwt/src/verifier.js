import Debug from 'debug';

const debug = Debug('feathers-authentication-jwt:verify');

class JWTVerifier {
  constructor (app, options = {}) {
    this.app = app;
    this.options = options;
    this.service = typeof options.service === 'string' ? app.service(options.service) : options.service;

    if (!this.service) {
      throw new Error(`options.service does not exist.\n\tMake sure you are passing a valid service path or service instance and it is initialized before feathers-authentication-jwt.`);
    }

    this.verify = this.verify.bind(this);
  }

  verify (req, payload, done) {
    debug('Received JWT payload', payload);

    const id = payload[this.service.id];

    if (id === undefined) {
      return done(null, { payload });
    }

    debug(`Looking up ${this.options.entity} by id`, id);

    this.service.get(id).then(entity => {
      return done(null, Object.assign({ payload }, entity));
    })
    .catch(error => {
      debug(`Error populating ${this.options.entity} with id ${id}`, error);
      return done(null, { payload });
    });
  }
}

export default JWTVerifier;
