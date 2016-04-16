'use strict';

const assert = require('assert');
const <%= codeName %> = require('../../../../<%= hookPath %>');

describe('<%= service %> <%= codeName %> hook', function() {
  it('hook can be used', function() {
    const mockHook = {
      type: '<%= type %>',
      app: {},
      params: {},
      result: {},
      data: {}
    };

    <%= codeName %>()(mockHook);

    assert.ok(mockHook.<%= codeName %>);
  });
});
