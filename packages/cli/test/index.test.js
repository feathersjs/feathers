const assert = require('assert');
const cli = require('../lib');

describe('feathers-cli', () => {
  it('is CommonJS compatible', () => {
    assert.equal(typeof require('../lib'), 'function');
  });

  it('basic functionality', done => {
    assert.equal(typeof cli, 'function', 'It worked');
    done();
  });

  it('runs the program with `generate` argument', () => {
    cli([ null, __filename, 'generate' ]);
  });
});
