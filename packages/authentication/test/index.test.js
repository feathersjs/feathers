const assert = require('assert');
const feathers = require('@feathersjs/feathers');

const authentication = require('../lib');

describe('authentication', () => {
  let app;

  beforeEach(() => {
    app = feathers().configure(authentication({
      secret: 'supersecret'
    }));
  });

  it('initializes', () => {
    assert.ok(app.passport);
  });
});
