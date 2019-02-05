const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const memory = require('feathers-memory');

const authentication = require('../../lib');

describe('authentication/hooks/authenticate', () => {
  let app;

  beforeEach(() => {
    app = feathers();
    app.use('/authentication', authentication(app, {
      secret: 'supersecret'
    }));
    app.use('/users', memory());

    app.setup();
  });

  it('throws an error when no strategies are passed', () => {
    try {
      authentication.authenticate();
      assert.fail('Should never get here');
    } catch (error) {
      assert.strictEqual(error.message, 'The authenticate hook needs at least one allowed strategy');
    }
  });
});
