const { NotAuthenticated } = require('@feathersjs/errors');
const SPLIT_HEADER = /(\S+)\s+(\S+)/;

module.exports = class JWTStrategy {
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

    return Object.assign({
      entity: authConfig.entity,
      service: authConfig.service,
      header: 'Authorization',
      schemes: [ 'Bearer', 'JWT' ]
    }, config);
  }

  verifyConfiguration () {
    const allowedKeys = [ 'entity', 'service', 'header', 'schemes' ];

    for (let key of Object.keys(this.configuration)) {
      if (!allowedKeys.includes(key)) {
        throw new Error(`Invalid JwtStrategy option 'authentication.${this.name}.${key}'. Did you mean to set it in 'authentication.jwtOptions'?`);
      }
    }
  }

  getEntity (id, params) {
    const { service } = this.configuration;
    const entityService = this.app.service(service);

    if (!entityService) {
      return Promise.reject(
        new NotAuthenticated(`Could not find entity service '${service}'`)
      );
    }

    return entityService.get(id, params);
  }

  authenticate (authentication, params) {
    const { accessToken, strategy } = authentication;
    const { entity } = this.configuration;

    if (!accessToken || (strategy && strategy !== this.name)) {
      return Promise.reject(new NotAuthenticated('Not authenticated'));
    }

    return this.authentication.verifyJWT(accessToken, params.jwt).then(payload => {
      const entityId = payload.sub;
      const result = {
        accessToken,
        authentication: {
          strategy: 'jwt',
          payload
        }
      };

      if (entity === null) {
        return result;
      }

      return this.getEntity(entityId, params)
        .then(value => Object.assign(result, {
          [entity]: value
        }));
    });
  }

  parse (req) {
    const result = { strategy: this.name };
    const { header, schemes } = this.configuration;
    const headerValue = req.headers && req.headers[header.toLowerCase()];

    if (!headerValue || typeof headerValue !== 'string') {
      return null;
    }

    const [ , scheme, schemeValue ] = headerValue.match(SPLIT_HEADER) || [];
    const hasScheme = scheme && schemes.some(
      current => new RegExp(current, 'i').test(scheme)
    );

    if (scheme && !hasScheme) {
      return null;
    }

    return Object.assign(result, {
      accessToken: hasScheme ? schemeValue : headerValue
    });
  }
};
