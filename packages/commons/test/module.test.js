const { expect } = require('chai');
const { _ } = require('../lib');

describe('module', () => {
  it('is commonjs compatible', () => {
    let commons = require('../lib');

    expect(typeof commons).to.equal('object');
    expect(typeof commons.stripSlashes).to.equal('function');
    expect(typeof commons.hooks).to.equal('object');
    expect(typeof commons._).to.equal('object');
  });

  it('exposes lodash methods under _', () => {
    expect(typeof _.each).to.equal('function');
    expect(typeof _.some).to.equal('function');
    expect(typeof _.every).to.equal('function');
    expect(typeof _.keys).to.equal('function');
    expect(typeof _.values).to.equal('function');
    expect(typeof _.isMatch).to.equal('function');
    expect(typeof _.isEmpty).to.equal('function');
    expect(typeof _.isObject).to.equal('function');
    expect(typeof _.extend).to.equal('function');
    expect(typeof _.omit).to.equal('function');
    expect(typeof _.pick).to.equal('function');
    expect(typeof _.merge).to.equal('function');
  });
});
