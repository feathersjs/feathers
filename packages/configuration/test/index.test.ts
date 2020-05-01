import { strict as assert } from 'assert';
import feathers, { Application } from '@feathersjs/feathers';
import plugin from '../src';

describe('@feathersjs/configuration', () => {
  const app: Application = feathers().configure(plugin());

  it('exports default', () => {
    assert.ok(typeof require('../lib') === 'function');
  });

  it('initialized app with default.json', () => {
    assert.equal(app.get('port'), 3030);
    assert.deepEqual(app.get('array'), [
      'one', 'two', 'three'
    ]);
    assert.deepEqual(app.get('deep'), { base: false });
    assert.deepEqual(app.get('nullish'), null);
  });

  it('works when called directly', () => {
    const fn = plugin();
    const conf = fn() as any;

    assert.strictEqual(conf.port, 3030);
  });
});
