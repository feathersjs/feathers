import assert from 'assert';
import { hello } from '../src';

describe('@feathersjs/authentication-oauth', () => {
  it('initializes', () => {
    assert.strictEqual(hello(), 'Hello');
  });
});
