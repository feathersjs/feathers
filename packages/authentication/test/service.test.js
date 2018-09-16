const assert = require('assert');
const jwt = require('jsonwebtoken');
const feathers = require('@feathersjs/feathers');

const getOptions = require('../lib/options');
const AuthService = require('../lib/service');

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

describe('Authentication service tests', () => {
  const message = 'Some payload';
  let app, service;

  beforeEach(() => {
    app = feathers();
    app.set('authentication', getOptions({
      secret: 'supersecret'
    }));
    
    const { path } = app.get('authentication');

    app.use(path, new AuthService(app));

    service = app.service(path);
  });

  it('settings returns authentication options', () => {
    assert.deepEqual(service.settings, app.get('authentication'));
  });

  describe('createJWT', () => {
    it('errors with no payload', () => {
      return service.createJWT()
        .then(() => assert.fail('Should never get here'))
        .catch(error => {
          assert.equal(error.message, 'payload is required');
        });
    });

    it('with default options', () => {
      const message = 'Some payload';

      return service.createJWT({ message }).then(accessToken => {
        assert.ok(typeof accessToken === 'string');

        const decoded = jwt.decode(accessToken);
        const options = app.get('authentication');

        assert.equal(decoded.message, message, 'Set payload');
        assert.ok(UUID.test(decoded.jti), 'Set `jti` to default UUID');
        assert.equal(decoded.aud, options.jwt.audience);
        assert.equal(decoded.iss, options.jwt.issuer);
      });
    });

    it('with default and overriden options', () => {
      const overrides = {
        issuer: 'someoneelse',
        audience: 'people',
        jwtid: 'something'
      };

      return service.createJWT({ message }, overrides).then(accessToken => {
        assert.ok(typeof accessToken === 'string');

        const decoded = jwt.decode(accessToken);

        assert.equal(decoded.message, message, 'Set payload');
        assert.equal(decoded.jti, 'something');
        assert.equal(decoded.aud, overrides.audience);
        assert.equal(decoded.iss, overrides.issuer);
      });
    });

    it('errors with invalid options', () => {
      const overrides = {
        algorithm: 'fdjsklfsndkl'
      };

      return service.createJWT({}, overrides)
        .then(() => assert.fail('Should never get here'))
        .catch(error => {
          assert.equal(error.message, '"algorithm" must be a valid string enum value');
        });
    });
  });

  describe('verifyJWT', () => {
    let validToken, expiredToken;

    beforeEach(() => service.createJWT({ message }).then(vt => {
      validToken = vt;

      return service.createJWT({}, {
        expiresIn: '1ms'
      }).then(et => {
        expiredToken = et;
      });
    }));

    it('returns payload when token is valid', () => {
      return service.verifyJWT(validToken).then(payload => {
        assert.equal(payload.message, message);
      });
    });

    it('errors when custom algorithm property does not match', () => {
      return service.verifyJWT(validToken, {
        algorithm: 'HS512'
      }).then(() => assert.fail('Should never get here')).catch(error => {
        assert.equal(error.message, 'invalid algorithm');
      });
    });

    it('errors when secret is different', () => {
      return service.verifyJWT(validToken, {}, 'fdjskl')
        .then(() => assert.fail('Should never get here'))
        .catch(error => {
          assert.equal(error.message, 'invalid signature');
        });
    });

    it('errors when other custom options do not match', () => {
      return service.verifyJWT(validToken, { issuer: 'someonelse' })
        .then(() => assert.fail('Should never get here'))
        .catch(error => {
          assert.ok(/jwt issuer invalid/.test(error.message));
        });
    });

    it('errors when token is expired', () => {
      return service.verifyJWT(expiredToken)
        .then(() => assert.fail('Should never get here'))
        .catch(error => {
          assert.equal(error.message, 'jwt expired');
        });
    });
  });

  describe('getEntity', () => {
    const sub = 'getEntity';

    beforeEach(() => app.use('/users', {
      id: 'id',
      get (id) {
        return Promise.resolve({
          id,
          service: true
        });
      }
    }));

    it('returns the entity from the token subject', () => {
      return service.create({}, {
        user: {
          id: sub
        }
      }).then(({ accessToken }) => service.getEntity(accessToken).then(user => {
        assert.deepEqual(user, {
          id: sub,
          service: true
        });
      }));
    });

    it('throws an error if it can not get the `entityId`', () => {
      delete app.service('users').id;
      app.get('authentication').entityId = 'invalid';

      return service.create({}, {
        user: {
          id: sub
        }
      }).then(() => assert.fail('Should never get here')).catch(error => {
        assert.equal(error.message, 'Can not set valid JWT subject from params.user.invalid');
      });
    });

    it('returns null if token subject is not set', () => {
      return service.create({})
        .then(({ accessToken }) => service.getEntity(accessToken).then(user => {
          assert.equal(user, null);
        }));
    });

    it('returns `null` if entity is explicitly disabled', () => {
      app.get('authentication').entity = null;

      return service.getEntity('fdjskl').then(result => {
        assert.equal(result, null);
      });
    });
  });

  describe('create', () => {
    it('creates a valid accessToken with defaults', () => {
      return service.create({}).then(result => {
        assert.ok(result.accessToken);

        const options = app.get('authentication');
        const decoded = jwt.decode(result.accessToken);

        assert.ok(UUID.test(decoded.jti), 'Set `jti` to default UUID');
        assert.equal(decoded.aud, options.jwt.audience);
        assert.equal(decoded.iss, options.jwt.issuer);
      });
    });

    it('creates a valid accessToken with params.payload', () => {
      return service.create({}, {
        payload: { message }
      }).then(result => {
        const decoded = jwt.decode(result.accessToken);

        assert.equal(decoded.message, message);
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

        assert.equal(decoded.sub, sub);
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

        assert.equal(decoded.sub, sub);
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
        assert.deepEqual(at, { accessToken });
      });
    });

    it('can remove a valid token by `params.authentication` with id `null`', () => {
      return service.remove(null, {
        authentication: {
          strategy: 'jwt',
          accessToken
        }
      }).then(at => {
        assert.deepEqual(at, { accessToken });
      });
    });

    it('errors when trying to remove with nothing', () => {
      return service.remove(null)
        .then(() => assert.fail('Should never get here'))
        .catch(error => {
          assert.equal(error.message, 'jwt must be provided');
        });
    });
  });

  describe('setup', () => {
    it('errors when there is no secret', () => {
      delete app.get('authentication').secret;

      try {
        service.setup();
        assert.fail('Should never get here');
      } catch (error) {
        assert.equal(error.message, `A 'secret' must be provided in your authentication configuration`);
      }
    });

    it('throws an error if entity service does not exist', () => {
      try {
        service.setup();
        assert.fail('Should never get here');
      } catch (error) {
        assert.equal(error.message, `The 'users' entity service does not exist (set to 'null' if it is not required)`);
      }
    });

    it('throws an error if entity service exists but has no `id`', () => {
      app.use('/users', {
        get () {}
      });
      
      try {
        service.setup();
        assert.fail('Should never get here');
      } catch (error) {
        assert.equal(error.message, `The 'users' service does not have an 'id' property and no 'entityId' option is set.`);
      }
    });

    it('passes when entity service exists and `entityId` property is set', () => {
      app.get('authentication').entityId = 'id';
      app.use('/users', {
        get () {}
      });
      
      service.setup();
    });

    it('does nothing when `entity` is explicitly `null`', () => {
      app.get('authentication').entity = null;

      service.setup();
    });
  });
});
