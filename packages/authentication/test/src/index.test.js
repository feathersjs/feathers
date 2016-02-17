const assert = require('assert');

describe('<%= name %>', () => {
  it('is CommonJS compatible', () => {
    assert.equal(typeof require('../../lib'), 'function');
  });
});