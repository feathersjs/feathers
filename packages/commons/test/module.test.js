import assert from 'assert';

describe('build', () => {
  it('it build and exported', () => {
    let commons = require('../lib/commons');
    assert.equal(typeof commons, 'object');
    assert.equal(typeof commons.socket, 'object');
    assert.equal(typeof commons.getArguments, 'function');
    assert.equal(typeof commons.stripSlashes, 'function');
    assert.equal(typeof commons.hooks, 'object');
  });
});
