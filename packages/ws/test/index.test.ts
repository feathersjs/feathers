import assert from 'assert';
import { hello } from '../src';

describe('@feathersjs/ws', () => {
  it('initializes', async () => {
    assert.strictEqual(hello(), 'Hello');
  });
});
