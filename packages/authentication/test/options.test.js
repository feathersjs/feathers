const assert = require('assert');
const getOptions = require('../lib/options');

describe('authentication/options', () => {
  it('initializes merged and default options', () => {
    const secret = 'supersecret';
    const options = getOptions({ secret });

    assert.deepEqual(options, {
      secret,
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
    });
  });
});
