import assert from 'assert';
import { Router } from '../../src/routing';

describe('router', () => {
  it('can lookup and insert a simple path and returns null for invalid path', () => {
    const r = new Router<string>();

    r.insert('/hello/there/you', 'test');

    const result = r.lookup('hello/there/you/');

    assert.deepStrictEqual(result, {
      params: {},
      data: 'test'
    });

    assert.strictEqual(r.lookup('not/there'), null);
    assert.strictEqual(r.lookup('not-me'), null);
  });

  it('can insert data at the root', () => {
    const r = new Router<string>();

    r.insert('', 'hi');

    const result = r.lookup('/');

    assert.deepStrictEqual(result, {
      params: {},
      data: 'hi'
    });
  });

  it('can insert with placeholder and has proper specificity', () => {
    const r = new Router<string>();

    r.insert('/hello/:id', 'one');
    r.insert('/hello/:id/you', 'two');
    r.insert('/hello/:id/:other', 'three');

    const first = r.lookup('hello/there/');

    assert.deepStrictEqual(first, {
      params: { id: 'there' },
      data: 'one'
    });

    const second = r.lookup('hello/yes/you');

    assert.deepStrictEqual(second, {
      params: { id: 'yes' },
      data: 'two'
    });

    const third = r.lookup('hello/yes/they');

    assert.deepStrictEqual(third, {
      params: {
        id: 'yes',
        other: 'they'
      },
      data: 'three'
    });

    assert.strictEqual(r.lookup('hello/yes/they/here'), null);
  });

  it('errors when placeholder in a path is different', () => {
    const r = new Router<string>();

    assert.throws(() => {
      r.insert('/hello/:id', 'one');
      r.insert('/hello/:test/you', 'two');
    }, {
      message: 'Can not add new placeholder \':test\' because placeholder \':id\' already exists'
    });
  });
});
