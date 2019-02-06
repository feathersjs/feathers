const assert = require('assert');
const jwt = require('jsonwebtoken');
const feathers = require('@feathersjs/feathers');

const getOptions = require('../lib/options');
const AuthService = require('../lib/service');
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

describe('authentication/service', () => {
  const message = 'Some payload';
  let app, service;

  beforeEach(() => {
    app = feathers();
    app.set('authentication', { secret: 'supersecret' });
    app.use('/authentication', new AuthService(app));

    service = app.service('/authentication');
  });

  it('settings returns authentication options', () => {
    assert.deepStrictEqual(service.configuration, getOptions(app.get('authentication')));
  });

  describe('create', () => {
    it('creates a valid accessToken with defaults', () => {
      return service.create({}).then(result => {
        assert.ok(result.accessToken);

        const options = service.configuration;
        const decoded = jwt.decode(result.accessToken);

        assert.ok(UUID.test(decoded.jti), 'Set `jti` to default UUID');
        assert.strictEqual(decoded.aud, options.jwt.audience);
        assert.strictEqual(decoded.iss, options.jwt.issuer);
      });
    });

    it('creates a valid accessToken with params.payload', () => {
      return service.create({}, {
        payload: { message }
      }).then(result => {
        const decoded = jwt.decode(result.accessToken);

        assert.strictEqual(decoded.message, message);
      });
    });

    it('sets the subject params[entity][entityService.id]', () => {
      const sub = 'someone';

      app.use('/users', {
        id: 'id',
        setup () {}
      });

      return service.create({}, {
        user: {
          id: sub
        }
      }).then(({ accessToken }) => {
        const decoded = jwt.decode(accessToken);

        assert.strictEqual(decoded.sub, sub);
      });
    });

    it('errors when subject can not be found', () => {
      app.use('/users', {
        id: 'id',
        setup () {}
      });

      return service.create({}, {
        user: {}
      }).then(() => {
        assert.fail('Should never get here');
      }).catch(error => {
        assert.strictEqual(error.name, 'NotAuthenticated');
        assert.strictEqual(error.message, 'Can not set subject from params.user.id');
      });
    });

    it('sets the subject params[entity][entityId]', () => {
      const sub = 'someone';

      app.get('authentication').entityId = 'customid';

      app.use('/users', {
        setup () {}
      });

      return service.create({}, {
        user: {
          customid: sub
        }
      }).then(({ accessToken }) => {
        const decoded = jwt.decode(accessToken);

        assert.strictEqual(decoded.sub, sub);
      });
    });

    it('errors for external requests with no authentication', () => {
      return app.service('authentication').create({}, {
        provider: 'external'
      }).then(() => {
        assert.fail('Should never get here');
      }).catch(error => {
        assert.strictEqual(error.name, 'NotAuthenticated');
        assert.strictEqual(error.message, 'No authentication information provided');
      });
    });
  });

  describe('remove', () => {
    let accessToken;

    beforeEach(() => service.createJWT({ message }).then(vt => {
      accessToken = vt;
    }));

    it('can remove a valid token by id', () => {
      return service.remove(accessToken).then(at => {
        assert.deepStrictEqual(at, { accessToken });
      });
    });

    it('can remove a valid token by `params.authentication` with id `null`', () => {
      return service.remove(null, {
        authentication: {
          strategy: 'jwt',
          accessToken
        }
      }).then(at => {
        assert.deepStrictEqual(at, { accessToken });
      });
    });

    it('errors when trying to remove with nothing', () => {
      return service.remove(null)
        .then(() => assert.fail('Should never get here'))
        .catch(error => {
          assert.strictEqual(error.message, 'jwt must be provided');
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

    it('throws an error if entity service does not exist', () => {
      try {
        app.setup();
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(error.message, `The 'users' entity service does not exist (set to 'null' if it is not required)`);
      }
    });

    it('throws an error if entity service exists but has no `id`', () => {
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

    it('throws an error if entity service exists but has no `id`', () => {
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

    it('passes when entity service exists and `entityId` property is set, sets path in configuration', () => {
      app.get('authentication').entityId = 'id';
      app.use('/users', {
        get () {}
      });
      
      app.setup();

      assert.strictEqual(app.authentication.path, 'authentication');
    });

    it('does nothing when `entity` is explicitly `null`', () => {
      app.get('authentication').entity = null;

      app.setup();
    });
  });
});
