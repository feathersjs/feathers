import assert from 'assert';
import feathers from 'feathers';
import { join } from 'path';
import plugin from '../src';

describe('feathers-configuration', () => {
  const app = feathers().configure(plugin(__dirname));

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
