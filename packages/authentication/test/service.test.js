const assert = require('assert');
const { omit } = require('lodash');
const jwt = require('jsonwebtoken');
const feathers = require('@feathersjs/feathers');
const memory = require('feathers-memory');

const defaultOptions = require('../lib/options');
const AuthService = require('../lib/service');
const { Strategy1 } = require('./fixtures');

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

describe('authentication/service', () => {
  const message = 'Some payload';
  let app, service;

  beforeEach(() => {
    app = feathers();
    app.use('/authentication', new AuthService(app, 'authentication', {
      secret: 'supersecret',
      strategies: [ 'first' ]
    }));
    app.use('/users', memory());

    service = app.service('/authentication');
    service.register('first', new Strategy1());
  });

  it('settings returns authentication options', () => {
    assert.deepStrictEqual(service.configuration, Object.assign({}, defaultOptions, app.get('authentication')));
  });

  describe('create', () => {
    it('creates a valid accessToken and includes strategy result', () => {
      return service.create({
        strategy: 'first',
        username: 'David'
      }).then(result => {
        const settings = service.configuration.jwtOptions;
        const decoded = jwt.decode(result.accessToken);

        assert.ok(result.accessToken);
        assert.deepStrictEqual(omit(result, 'accessToken'), Strategy1.result);
        assert.ok(UUID.test(decoded.jti), 'Set `jti` to default UUID');
        assert.strictEqual(decoded.aud, settings.audience);
        assert.strictEqual(decoded.iss, settings.issuer);
      });
    });

    it('fails when strategy fails', () => {
      return service.create({
        strategy: 'first',
        username: 'Dave'
      }).then(() => {
        assert.fail('Should never get here');
      }).catch(error => {
        assert.strictEqual(error.name, 'NotAuthenticated');
        assert.strictEqual(error.message, 'Invalid Dave');
      });
    });

    it('creates a valid accessToken with strategy and params.payload', () => {
      return service.create({
        strategy: 'first',
        username: 'David'
      }, {
        payload: { message }
      }).then(result => {
        const decoded = jwt.decode(result.accessToken);

        assert.strictEqual(decoded.message, message);
      });
    });

    it('sets the subject authResult[entity][entityService.id]', () => {
      return service.create({
        strategy: 'first',
        username: 'David'
      }).then(({ accessToken }) => {
        const decoded = jwt.decode(accessToken);

        assert.strictEqual(decoded.sub, Strategy1.result.user.id.toString());
      });
    });

    it('sets the subject authResult[entity][entityId]', () => {
      app.get('authentication').entityId = 'name';

      return service.create({
        strategy: 'first',
        username: 'David'
      }).then(({ accessToken }) => {
        const decoded = jwt.decode(accessToken);

        assert.strictEqual(decoded.sub, Strategy1.result.user.name.toString());
      });
    });

    it('does not override the subject if already set', () => {
      const subject = 'Davester';

      return service.create({
        strategy: 'first',
        username: 'David'
      }, {
        jwt: { subject }
      }).then(({ accessToken }) => {
        const decoded = jwt.decode(accessToken);

        assert.strictEqual(decoded.sub, subject);
      });
    });

    it('errors when subject can not be found', () => {
      app.service('users').options.id = 'somethingElse';

      return service.create({
        strategy: 'first',
        username: 'David'
      }).then(() => {
        assert.fail('Should never get here');
      }).catch(error => {
        assert.strictEqual(error.name, 'NotAuthenticated');
        assert.strictEqual(error.message, 'Can not set subject from user.somethingElse');
      });
    });

    it('errors when no allowed strategies are set', () => {
      const configuration = service.configuration;

      delete configuration.strategies;

      app.set('authentication', configuration);

      return service.create({
        strategy: 'first',
        username: 'Dave'
      }).then(() => {
        assert.fail('Should never get here');
      }).catch(error => {
        assert.strictEqual(error.name, 'NotAuthenticated');
        assert.strictEqual(error.message, 'No authentication strategies allowed for creating a JWT');
      });
    });
  });

  describe('remove', () => {
    it('can remove with authentication strategy set', () => {
      return service.remove(null, {
        authentication: {
          strategy: 'first',
          username: 'David'
        }
      }).then(authResult => {
        assert.deepStrictEqual(authResult, Strategy1.result);
      });
    });

    it('passes when id is set and matches accessToken', () => {
      return service.remove('test', {
        authentication: {
          strategy: 'first',
          username: 'David',
          accessToken: 'test'
        }
      }).then(authResult => {
        assert.deepStrictEqual(authResult, Strategy1.result);
      });
    });

    it('passes when id is set and does not match accessToken', () => {
      return service.remove('test', {
        authentication: {
          strategy: 'first',
          username: 'David',
          accessToken: 'testing'
        }
      }).then(() => {
        assert.fail('Should never get here');
      }).catch(error => {
        assert.strictEqual(error.name, 'NotAuthenticated');
        assert.strictEqual(error.message, 'Invalid access token');
      });
    });

    it('errors when trying to remove with nothing', () => {
      return service.remove(null)
        .then(() => assert.fail('Should never get here'))
        .catch(error => {
          assert.strictEqual(error.message, 'No valid authentication strategy available');
        });
    });
  });

  describe('setup', () => {
    it('errors when there is no secret', () => {
      delete app.get('authentication').secret;

      try {
        app.setup();
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(error.message, `A 'secret' must be provided in your authentication configuration`);
      }
    });

    it('errors when there is stragies', () => {
      app.get('authentication').strategies = [];

      try {
        app.setup();
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(error.message, `At least one valid authentication strategy required in 'authentication.strategies'`);
      }
    });

    it('throws an error if entity service does not exist', () => {
      const app = feathers();

      app.use('/authentication', new AuthService(app, 'authentication', {
        secret: 'supersecret',
        strategies: [ 'first' ]
      }));

      try {
        app.setup();
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(error.message, `The 'users' entity service does not exist (set to 'null' if it is not required)`);
      }
    });

    it('throws an error if entity service exists but has no `id`', () => {
      const app = feathers();

      app.use('/authentication', new AuthService(app, 'authentication', {
        secret: 'supersecret',
        strategies: [ 'first' ]
      }));

      app.use('/users', {
        get () {}
      });

      try {
        app.setup();
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(error.message, `The 'users' service does not have an 'id' property and no 'entityId' option is set.`);
      }
    });

    it('passes when entity service exists and `entityId` property is set', () => {
      app.get('authentication').entityId = 'id';
      app.use('/users', {
        get () {}
      });

      app.setup();
    });

    it('does nothing when `entity` is explicitly `null`', () => {
      app.get('authentication').entity = null;

      app.setup();
    });
  });
});
