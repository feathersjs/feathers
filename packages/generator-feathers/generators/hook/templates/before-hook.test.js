import assert from 'assert';
import <%= codeName %> from '<%= hookPath %>';

const mockHook = {
  type: 'before',
  app: {},
  params: {},
  result: {},
  data: {}
};

describe('<%= service %> <%= codeName %> hook', () => {
  it('can be used', () => {
    let hook = <%= codeName %>()(mockHook);
    assert.equal(hook.type, 'before');
  });
});