import assert from 'assert';
import { hello } from '../src';

describe('@feathersjs/schema', () => {
  it('initializes', async () => {
    assert.strictEqual(hello(), 'Hello');
  });
});
