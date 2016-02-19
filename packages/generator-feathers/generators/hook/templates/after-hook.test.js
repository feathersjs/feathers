'use strict';

const assert = require('assert');
const <%= codeName %> = require('<%= hookPath %>');

const mockHook = {
  type: 'after',
  app: {},
  params: {},
  result: {},
  data: {}
};

describe('<%= service %> <%= codeName %> hook', () => {
  it('can be used', () => {
    const hook = <%= codeName %>()(mockHook);
    assert.equal(hook.type, 'after');
  });
});