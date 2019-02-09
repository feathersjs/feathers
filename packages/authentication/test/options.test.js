const assert = require('assert');
const getOptions = require('../lib/options');

describe('authentication/options', () => {
  it('initializes merged and default options', () => {
    const secret = 'supersecret';
    const options = getOptions({ secret });

    assert.ok(options.secret);
    assert.strictEqual(options.entity, 'user');
    assert.strictEqual(options.service, 'users');
  });
});
