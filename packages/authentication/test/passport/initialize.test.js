const initialize = require('../../lib/passport/initialize');
const { expect } = require('chai');

describe('passport:initialize', () => {
  it('it returns a function', () => {
    expect(typeof initialize()).to.equal('function');
  });
});
