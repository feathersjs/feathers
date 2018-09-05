const { merge } = require('lodash');

const defaults = {
  path: '/authentication',
  header: 'Authorization',
  entity: 'user',
  service: 'users',
  jwt: {
    header: { typ: 'access' }, // by default is an access token but can be any type
    audience: 'https://yourdomain.com', // The resource server where the token is processed
    issuer: 'feathers', // The issuing server, application or resource
    algorithm: 'HS256',
    expiresIn: '1d'
  }
};

module.exports = function (...otherOptions) {
  return merge({}, defaults, ...otherOptions);
};
