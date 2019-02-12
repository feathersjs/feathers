const assert = require('assert');
const getApp = require('./fixture');

describe('@feathersjs/authentication-local/strategy', () => {
  const password = 'localsecret';
  const email = 'localtester@feathersjs.com';

  let app, user;

  beforeEach(() => {
    app = getApp();

    return app.service('users').create({ email, password });
  });

  it('authenticates an existing user', () => {
    return app.service('authentication').create({
      strategy: 'local',
      email,
      password
    }).then(authResult => {
      console.log(authResult);
    });
  });
});
