const assert = require('assert');

const commons = require('../lib');

describe('@feathersjs/transport-commons', () => {
  it('re-exports commons', () => {
    assert.ok(commons.socket);
    assert.ok(commons.routing);
    assert.ok(commons.channels);
  });
});
