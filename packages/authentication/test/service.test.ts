import assert from 'assert';
import omit from 'lodash/omit';
import jwt from 'jsonwebtoken';
import { feathers, Application } from '@feathersjs/feathers';
import { memory, Service as MemoryService } from '@feathersjs/memory';

import defaultOptions from '../src/options';
import { AuthenticationService } from '../src';

import { Strategy1 } from './fixtures';

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

describe('authentication/service', () => {
  const message = 'Some payload';

  let app: Application<{
    authentication: AuthenticationService,
    users: MemoryService
  }>;

  beforeEach(() => {
    app = feathers();
    app.use('authentication', new AuthenticationService(app, 'authentication', {
      entity: 'user',
      service: 'users',
      secret: 'supersecret',
      authStrategies: [ 'first' ]
    }));
    app.use('users', memory());

    app.service('authentication').register('first', new Strategy1());
  });

  it('settings returns authentication options', () => {
    assert.deepStrictEqual(app.service('authentication').configuration, Object.assign({}, defaultOptions, app.get('authentication')));
  });

  it('app.defaultAuthentication()', () => {
    assert.strictEqual(app.defaultAuthentication(), app.service('authentication'));
    assert.throws(() => app.defaultAuthentication('dummy'), {
      message: 'Can not find service \'dummy\''
    });
  });

  describe('create', () => {
    it('creates a valid accessToken and includes strategy result', async () => {
      const service = app.service('authentication');
      const result = await service.create({
        strategy: 'first',
        username: 'David'
      });

      const settings = service.configuration.jwtOptions;
      const decoded = jwt.decode(result.accessToken);

      if (typeof decoded === 'string') {
        throw new Error('Unexpected decoded JWT type');
      }

      assert.ok(result.accessToken);
      assert.deepStrictEqual(omit(result, 'accessToken', 'authentication'), Strategy1.result);
      assert.deepStrictEqual(result.authentication.payload, decoded);
      assert.ok(UUID.test(decoded.jti), 'Set `jti` to default UUID');
      assert.strictEqual(decoded.aud, settings.audience);
      assert.strictEqual(decoded.iss, settings.issuer);
    });

    it('fails when strategy fails', async () => {
      try {
        await app.service('authentication').create({
          strategy: 'first',
          username: 'Dave'
        });
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(error.name, 'NotAuthenticated');
        assert.strictEqual(error.message, 'Invalid Dave');
      }
    });

    it('creates a valid accessToken with strategy and params.payload', async () => {
      const result = await app.service('authentication').create({
        strategy: 'first',
        username: 'David'
      }, {
        payload: { message }
      });

      const decoded = jwt.decode(result.accessToken);

      if (typeof decoded === 'string') {
        throw new Error('Unexpected decoded JWT type');
      }

      assert.strictEqual(decoded.message, message);
    });

    it('sets the subject authResult[entity][entityService.id]', async () => {
      const { accessToken } = await app.service('authentication').create({
        strategy: 'first',
        username: 'David'
      });

      const decoded = jwt.decode(accessToken);

      assert.strictEqual(decoded.sub, Strategy1.result.user.id.toString());
    });

    it('sets the subject authResult[entity][entityId]', async () => {
      app.get('authentication').entityId = 'name';

      const { accessToken } = await app.service('authentication').create({
        strategy: 'first',
        username: 'David'
      });

      const decoded = jwt.decode(accessToken);

      assert.strictEqual(decoded.sub, Strategy1.result.user.name.toString());
    });

    it('does not override the subject if already set', async () => {
      const subject = 'Davester';

      const { accessToken } = await app.service('authentication').create({
        strategy: 'first',
        username: 'David'
      }, {
        jwt: { subject }
      });

      const decoded = jwt.decode(accessToken);

      assert.strictEqual(decoded.sub, subject);
    });

    it('errors when subject can not be found', async () => {
      // @ts-ignore
      app.service('users').options.id = 'somethingElse';

      try {
        await app.service('authentication').create({
          strategy: 'first',
          username: 'David'
        });
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(error.name, 'NotAuthenticated');
        assert.strictEqual(error.message, 'Can not set subject from user.somethingElse');
      }
    });

    it('errors when no allowed strategies are set', async () => {
      const service = app.service('authentication');
      const configuration = service.configuration;

      delete configuration.authStrategies;

      app.set('authentication', configuration);

      try {
        await service.create({
          strategy: 'first',
          username: 'Dave'
        });
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(error.name, 'NotAuthenticated');
        assert.strictEqual(error.message, 'No authentication strategies allowed for creating a JWT (`authStrategies`)');
      }
    });
  });

  describe('remove', () => {
    it('can remove with authentication strategy set', async () => {
      const authResult = await app.service('authentication').remove(null, {
        authentication: {
          strategy: 'first',
          username: 'David'
        }
      });

      assert.deepStrictEqual(authResult, Strategy1.result);
    });

    it('passes when id is set and matches accessToken', async () => {
      const authResult = await app.service('authentication').remove('test', {
        authentication: {
          strategy: 'first',
          username: 'David',
          accessToken: 'test'
        }
      });

      assert.deepStrictEqual(authResult, Strategy1.result);
    });

    it('passes when id is set and does not match accessToken', async () => {
      try {
        await app.service('authentication').remove('test', {
          authentication: {
            strategy: 'first',
            username: 'David',
            accessToken: 'testing'
          }
        });
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(error.name, 'NotAuthenticated');
        assert.strictEqual(error.message, 'Invalid access token');
      }
    });

    it('errors when trying to remove with nothing', async () => {
      try {
        await app.service('authentication').remove(null);
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(error.message, 'Invalid authentication information (no `strategy` set)');
      }
    });
  });

  describe('setup', () => {
    it('errors when there is no secret', async () => {
      delete app.get('authentication').secret;

      await assert.rejects(() => app.setup(), {
        message: 'A \'secret\' must be provided in your authentication configuration'
      });
    });

    it('throws an error if service name is not set', async () => {
      const otherApp = feathers();

      otherApp.use('/authentication', new AuthenticationService(otherApp, 'authentication', {
        secret: 'supersecret',
        authStrategies: [ 'first' ]
      }));

      await assert.rejects(() => otherApp.setup(), {
        message: 'The \'service\' option is not set in the authentication configuration'
      });
    });

    it('throws an error if entity service does not exist', async () => {
      const otherApp = feathers();

      otherApp.use('/authentication', new AuthenticationService(otherApp, 'authentication', {
        entity: 'user',
        service: 'users',
        secret: 'supersecret',
        authStrategies: [ 'first' ]
      }));

      await assert.rejects(() => otherApp.setup(), {
        message: 'Can not find service \'users\''
      });
    });

    it('throws an error if entity service exists but has no `id`', async () => {
      const otherApp = feathers();

      otherApp.use('/authentication', new AuthenticationService(otherApp, 'authentication', {
        entity: 'user',
        service: 'users',
        secret: 'supersecret',
        strategies: [ 'first' ]
      }));

      otherApp.use('/users', {
        async get () {
          return {};
        }
      });

      await assert.rejects(() => otherApp.setup(), {
        message: 'The \'users\' service does not have an \'id\' property and no \'entityId\' option is set.'
      });
    });

    it('passes when entity service exists and `entityId` property is set', () => {
      app.get('authentication').entityId = 'id';
      app.use('users', memory());

      app.setup();
    });

    it('does nothing when `entity` is explicitly `null`', () => {
      app.get('authentication').entity = null;

      app.setup();
    });
  });
});
