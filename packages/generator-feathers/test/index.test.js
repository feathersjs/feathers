import assert from 'assert';
import plugin from '../src';

describe('generator-feathers', () => {
  it('basic functionality', done => {
    assert.equal(typeof plugin, 'function', 'It worked');
    done();
  });
});
