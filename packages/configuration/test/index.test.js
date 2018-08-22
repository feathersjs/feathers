const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const { join } = require('path');

describe('@feathersjs/configuration', () => {
  const originalEnv = {};
  let app;
  let plugin;

  before(() => {
    originalEnv.NODE_ENV = process.env.NODE_ENV;
    originalEnv.NODE_CONFIG_DIR = process.env.NODE_CONFIG_DIR;

    process.env.NODE_ENV = 'testing';
    process.env.NODE_CONFIG_DIR = join(__dirname, 'config');

    plugin = require('../lib');
    app = feathers().configure(plugin());
  });

  after(() => {
    process.env.NODE_ENV = originalEnv.NODE_ENV;
    process.env.NODE_CONFIG_DIR = originalEnv.NODE_CONFIG_DIR;
  });

  it('exports default', () =>
    assert.equal(plugin, plugin.default)
  );

  it('initialized app with default data', () =>
    assert.equal(app.get('port'), 3030)
  );

  it('initialized with <env>', () =>
    assert.equal(app.get('from'), 'testing')
  );

  it('initialized with <env> derived data module', () =>
    assert.equal(app.get('derived'), 'Hello World')
  );

  it('initialized property with environment variable', () =>
    assert.equal(app.get('environment'), 'testing')
  );

  it('initialized property with environment variable from <env>', () =>
    assert.equal(app.get('testEnvironment'), 'testing')
  );

  it('initialized property with derived environment variable from <env> module', () =>
    assert.equal(app.get('derivedEnvironment'), 'testing')
  );

  it('uses an escape character', () =>
    assert.equal(app.get('unescaped'), 'NODE_ENV')
  );

  it('normalizes relative path names', () =>
    assert.equal(app.get('path'), join(__dirname, 'something'))
  );

  it('converts environment variables recursively', () =>
    assert.equal(app.get('deeply').nested.env, 'testing')
  );

  it('converts arrays as actual arrays', () =>
    assert.ok(Array.isArray(app.get('array')))
  );

  it('works when called directly', () => {
    const fn = plugin();

    assert.equal(fn().port, '3030');
  });

  it('deep merges properties', () =>
    assert.deepEqual(app.get('deep'), {
      base: false,
      merge: true
    })
  );

  it('supports null value', () => {
    assert.strictEqual(app.get('nullish'), null);
  });
});
