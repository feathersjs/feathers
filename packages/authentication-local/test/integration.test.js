import feathers from 'feathers';
import authentication from 'feathers-authentication';
import memory from 'feathers-memory';
import hooks from 'feathers-hooks';
import local from '../src';
import { expect } from 'chai';

describe('integration', () => {
  it('verifies', () => {
    const User = {
      email: 'admin@feathersjs.com',
      password: 'password'
    };

    const req = {
      query: {},
      body: Object.assign({}, User),
      headers: {},
      cookies: {}
    };

    const app = feathers();

    app.configure(hooks())
      .use('/users', memory())
      .configure(authentication({ secret: 'secret' }))
      .configure(local());

    app.service('users').hooks({
      before: {
        create: local.hooks.hashPassword()
      }
    });

    return app.service('users').create(User).then(() => {
      return app.authenticate('local')(req).then(result => {
        expect(result.success).to.equal(true);
        expect(result.data.user.email).to.equal(User.email);
        expect(result.data.user.password).to.not.equal(undefined);
      });
    });
  });
});
