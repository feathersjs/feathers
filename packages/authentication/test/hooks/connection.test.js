const assert = require('assert');
const feathers = require('@feathersjs/feathers');

const hook = require('../../lib/hooks/connection');

describe('authentication/hooks/connection', () => {
  let app, service;

  beforeEach(() => {
    app = feathers().use('/authentication', {
      create (data, params) {
        if (params.noAccessToken) {
          return Promise.resolve({});
        }

        return Promise.resolve({
          accessToken: '1234',
          authentication: { strategy: 'test' },
          additionalParams: true
        });
      },

      remove () {
        return Promise.resolve({ accessToken: '1234' });
      }
    });

    service = app.service('authentication');
    service.hooks({
      after: hook()
    });
  });

  it('create does nothing when there is no connection', () => {
    return service.create({}, {}).then(result => {
      assert.deepStrictEqual(result, {
        accessToken: '1234',
        authentication: { strategy: 'test' },
        additionalParams: true
      });
    });
  });

  it('create (login) updates `params.connection.authentication` with all params', () => {
    const connection = {};

    return service.create({}, { connection }).then(() => {
      assert.deepStrictEqual(connection, {
        authentication: {
          strategy: 'jwt',
          accessToken: '1234'
        },
        additionalParams: true
      });
    });
  });

  it('create (login) does nothing when there is no accessToken', () => {
    const connection = {};

    return service.create({}, {
      connection,
      noAccessToken: true
    }).then(() => {
      assert.deepStrictEqual(connection, {});
    });
  });

  it('remove (logout) deletes `connection.authentication` if token matches', () => {
    const connection = {
      authentication: { strategy: 'jwt', accessToken: '1234' }
    };

    return service.remove('test', { connection }).then(() => {
      assert.deepStrictEqual(connection, {});
    });
  });

  it('remove (logout) does nothing if token does not match', () => {
    const connection = {
      authentication: { strategy: 'jwt', accessToken: '12343' }
    };

    return service.remove('test', { connection }).then(() => {
      assert.deepStrictEqual(connection, {
        authentication: { strategy: 'jwt', accessToken: '12343' }
      });
    });
  });
});
