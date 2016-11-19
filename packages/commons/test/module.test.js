if (!global._babelPolyfill) { require('babel-polyfill'); }

import { expect } from 'chai';

describe('build', () => {
  it('it build and exported', () => {
    let commons = require('../lib/commons');
    expect(typeof commons).to.equal('object');
    expect(typeof commons.getArguments).to.equal('function');
    expect(typeof commons.stripSlashes).to.equal('function');
    expect(typeof commons.hooks).to.equal('object');
  });
});
