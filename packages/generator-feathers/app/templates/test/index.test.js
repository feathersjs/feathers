import assert from 'assert';
import plugin from '../src';

describe('<%= name %>', () => {
  it('basic functionality', done => {
    assert.equal(typeof plugin, 'function', 'It worked');
    done();
  });
});
