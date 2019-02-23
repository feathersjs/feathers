const merge = require('lodash.merge');

const defaults = {
  path: '/authentication',
  header: 'Authorization',
  entity: 'user',
  service: 'users',
  passReqToCallback: true,
  session: false,
  cookie: {
    enabled: false,
    name: 'feathers-jwt',
    httpOnly: false,
    secure: true
  },
  jwtRemoveOptions: [],
  jwt: {
    header: { typ: 'access' }, // by default is an access token but can be any type
    audience: 'https://yourdomain.com', // The resource server where the token is processed
    subject: 'anonymous', // Typically the entity id associated with the JWT
    issuer: 'feathers', // The issuing server, application or resource
    algorithm: 'HS256',
    expiresIn: '1d'
  }
};

module.exports = function (...otherOptions) {
  const mergedOptions = merge({}, defaults, ...otherOptions);
  for (let idx in mergedOptions.jwtRemoveOptions)
  {
    let optionName = mergedOptions.jwtRemoveOptions[idx];
    delete mergedOptions.jwt[optionName];
  }
  return mergedOptions;
};
