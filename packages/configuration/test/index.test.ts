import assert from 'assert';
import { join } from 'path';
import feathers, { Application } from '@feathersjs/feathers';

describe('@feathersjs/configuration', () => {
  const originalEnv: { [key: string]: any } = {};
  let app: Application;
  let plugin: any;

  before(() => {
    originalEnv.NODE_ENV = process.env.NODE_ENV;
    originalEnv.NODE_CONFIG_DIR = process.env.NODE_CONFIG_DIR;

    process.env.NODE_ENV = 'testing';
    process.env.NODE_CONFIG_DIR = join(__dirname, 'config');
    process.env.PATH_ENV = '../something';

    plugin = require('../lib');
    app = feathers().configure(plugin());
  });

  after(() => {
    process.env.NODE_ENV = originalEnv.NODE_ENV;
    process.env.NODE_CONFIG_DIR = originalEnv.NODE_CONFIG_DIR;
  });

  it('exports default', () =>
    assert.strictEqual(plugin, plugin.default)
  );

  it('initialized app with default data', () =>
    assert.strictEqual(app.get('port'), 3030)
  );

  it('initialized with <env>', () =>
    assert.strictEqual(app.get('from'), 'testing')
  );

  it('initialized with <env> derived data module', () =>
    assert.strictEqual(app.get('derived'), 'Hello World')
  );

  it('initialized property with environment variable', () =>
    assert.strictEqual(app.get('environment'), 'testing')
  );

  it('initialized property with environment variable from <env>', () =>
    assert.strictEqual(app.get('testEnvironment'), 'testing')
  );

  it('initialized property with derived environment variable from <env> module', () =>
    assert.strictEqual(app.get('derivedEnvironment'), 'testing')
  );

  it('uses an escape character', () =>
    assert.strictEqual(app.get('unescaped'), 'NODE_ENV')
  );

  it('normalizes relative path names', () =>
    assert.strictEqual(app.get('path'), join(__dirname, 'something'))
  );

  it('normalizes relative path names from environment variable', () =>
    assert.strictEqual(app.get('pathFromEnv'), join(__dirname, 'something'))
  );

  it('converts environment variables recursively', () =>
    assert.strictEqual(app.get('deeply').nested.env, 'testing')
  );

  it('converts arrays as actual arrays', () =>
    assert.ok(Array.isArray(app.get('array')))
  );

  it('works when called directly', () => {
    const fn = plugin();

    assert.strictEqual(fn().port, 3030);
  });

  it('deep merges properties', () =>
    assert.deepStrictEqual(app.get('deep'), {
      base: false,
      merge: true
    })
  );

  it('supports null value', () => {
    assert.strictEqual(app.get('nullish'), null);
  });
});
