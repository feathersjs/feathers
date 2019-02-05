/* eslint-disable no-unused-expressions */
const feathers = require('@feathersjs/feathers');
const expressify = require('@feathersjs/express');
const authentication = require('@feathersjs/authentication');
const memory = require('feathers-memory');
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
      cookies: {},
      params: {
        query: {},
        provider: 'rest',
        headers: {},
        session: {},
        cookies: {},
        data: 'Hello, world'
      }
    };

    const issueJWT = () => {
      return hook => {
        const app = hook.app;
        const id = hook.result.id;
        return app.passport.createJWT({
          userId: id
        }, app.get('authentication')).then(accessToken => {
          hook.result.accessToken = accessToken;
          return Promise.resolve(hook);
        });
      };
    };

    const app = expressify(feathers());
    app.use('/users', memory())
      .configure(authentication({ secret: 'secret' }))
      .configure(jwt());

    let paramsRecieved;
    app.service('users').hooks({
      before: {
        get: (hook) => {
          paramsRecieved = hook.params.data;
        }
      },
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
        expect(paramsRecieved).to.equal('Hello, world');
      });
    });
  });

  it('errors when user is not found', () => {
    const app = expressify(feathers());
    const req = {
      query: {},
      body: {},
      headers: {},
      cookies: {}
    };

    app.use('/users', memory())
      .configure(authentication({ secret: 'secret' }))
      .configure(jwt());

    app.setup();

    return app.passport.createJWT({
      userId: 'wrong'
    }, app.get('authentication')).then(accessToken => {
      req.headers = { 'authorization': accessToken };

      return app.authenticate('jwt')(req).then(() => {
        throw new Error('Should never get here');
      }).catch(error => {
        expect(error.name).to.equal('NotFound');
      });
    });
  });
});
