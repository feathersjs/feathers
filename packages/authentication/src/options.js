import merge from 'lodash.merge';

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
  jwt: {
    header: { typ: 'access' }, // by default is an access token but can be any type
    audience: 'https://yourdomain.com', // The resource server where the token is processed
    subject: 'anonymous', // Typically the entity id associated with the JWT
    issuer: 'feathers', // The issuing server, application or resource
    algorithm: 'HS256',
    expiresIn: '1d'
  }
};

export default function (...otherOptions) {
  return merge({}, defaults, ...otherOptions);
}
