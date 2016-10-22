if (!global._babelPolyfill) { require('babel-polyfill'); }

import assert from 'assert';
import plugin from '../src';

describe('feathers-socket-commons', () => {
  it('is CommonJS compatible', () => {
    assert.equal(typeof require('../lib'), 'function');
  });

  it('basic functionality', done => {
    assert.equal(typeof plugin, 'function', 'It worked');
    done();
  });
});
