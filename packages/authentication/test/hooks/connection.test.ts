import assert from 'assert';
import feathers, { Params, Service } from '@feathersjs/feathers';

import { AuthenticationRequest } from '../../lib/core';
import hook from '../../src/hooks/connection';
import { AuthenticationService } from '../../src';
import { AuthenticationResult } from '../../src/core';

describe('authentication/hooks/connection', () => {
  const app = feathers().use('/authentication', {
    async create(_data: AuthenticationRequest, params: Params) {
      if (params.noAccessToken) {
        return {};
      }

      return {
        accessToken: '1234',
        authentication: { strategy: 'test' },
        additionalParams: true
      };
    },

    async remove() {
      return { accessToken: '1234' };
    }
  });

  const service = app.service('authentication') as AuthenticationService & Service<AuthenticationResult>;

  service.hooks({
    after: {
      all: [ hook() ]
    }
  });

  it('create does nothing when there is no connection', async () => {
    const result = await service.create({}, {});

    assert.deepStrictEqual(result, {
      accessToken: '1234',
      authentication: { strategy: 'test' },
      additionalParams: true
    });
  });

  it('create (login) updates `params.connection.authentication` with all params', async () => {
    const connection = {};

    await service.create({}, { connection });

    assert.deepStrictEqual(connection, {
      authentication: {
        strategy: 'jwt',
        accessToken: '1234'
      },
      additionalParams: true
    });
  });

  it('create (login) does nothing when there is no accessToken', async () => {
    const connection = {};

    await service.create({}, {
      connection,
      noAccessToken: true
    });

    assert.deepStrictEqual(connection, {});
  });

  it('remove (logout) deletes `connection.authentication` if token matches', async () => {
    const connection = {
      authentication: { strategy: 'jwt', accessToken: '1234' }
    };

    await service.remove('test', { connection });

    assert.deepStrictEqual(connection, {});
  });

  it('remove (logout) does nothing if token does not match', async () => {
    const connection = {
      authentication: { strategy: 'jwt', accessToken: '12343' }
    };

    await service.remove('test', { connection });

    assert.deepStrictEqual(connection, {
      authentication: { strategy: 'jwt', accessToken: '12343' }
    });
  });
});
