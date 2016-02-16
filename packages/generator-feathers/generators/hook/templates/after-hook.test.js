import assert from 'assert';
import <%= codeName %> from '<%= hookPath %>';

const mockHook = {
  type: 'after',
  app: {},
  params: {},
  result: {},
  data: {}
};

describe('<%= service %> <%= codeName %> hook', () => {
  it('can be used', () => {
    let hook = <%= codeName %>()(mockHook);
    assert.equal(hook.type, 'after');
  });
});