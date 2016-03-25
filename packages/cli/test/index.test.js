import assert from 'assert';
import plugin from '../src';

describe('feathers-cli', () => {
  it('is CommonJS compatible', () => {
    assert.equal(typeof require('../lib'), 'object');
  });

  it('basic functionality', done => {
    assert.equal(typeof plugin, 'object', 'It worked');
    done();
  });
});
