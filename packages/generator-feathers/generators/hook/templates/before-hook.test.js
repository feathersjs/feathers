'use strict';

const assert = require('assert');
const <%= codeName %> = require('<%= hookPath %>');

const mockHook = {
  type: 'before',
  app: {},
  params: {},
  result: {},
  data: {}
};

describe('<%= service %> <%= codeName %> hook', () => {
  it('can be used', () => {
    const hook = <%= codeName %>()(mockHook);
    assert.equal(hook.type, 'before');
  });
});