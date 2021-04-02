---
to: packages/<%= name %>/test/index.test.ts
---

import assert from 'assert';
import { hello } from '../src';

describe('@feathersjs/<%= name %>', () => {
  it('initializes', async () => {
    assert.strictEqual(hello(), 'Hello');
  });
});
