/* eslint-disable no-unused-expressions */
const feathers = require('feathers');
const authentication = require('feathers-authentication');
const memory = require('feathers-memory');
const hooks = require('feathers-hooks');
const { expect } = require('chai');
const jwt = require('../lib');

describe('integration', () => {
  it('verifies', () => {
    const User = {
      email: 'admin@feathersjs.com',
      password: 'password'
    };

    const req = {
      query: {},
      body: {},
      headers: {},
      cookies: {}
    };

    const issueJWT = () => {
      return hook => {
        const app = hook.app;
        const id = hook.result.id;
        return app.passport.createJWT({ userId: id }, app.get('authentication')).then(accessToken => {
          hook.result.accessToken = accessToken;
          return Promise.resolve(hook);
        });
      };
    };

    const app = feathers();

    app.configure(hooks())
      .use('/users', memory())
      .configure(authentication({ secret: 'secret' }))
      .configure(jwt());

    app.service('users').hooks({
      after: {
        create: issueJWT()
      }
    });

    app.setup();

    return app.service('users').create(User).then(user => {
      req.headers = { 'authorization': user.accessToken };

      return app.authenticate('jwt')(req).then(result => {
        expect(result.success).to.equal(true);
        expect(result.data.user.email).to.equal(User.email);
        expect(result.data.user.password).to.not.equal(undefined);
      });
    });
  });
});
