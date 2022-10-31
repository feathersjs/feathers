import assert from 'assert'
import { Router } from '../../src/routing'

describe('router', () => {
  it('can lookup and insert a simple path and returns null for invalid path', () => {
    const r = new Router<string>()

    r.insert('/hello/there/you', 'test')

    const result = r.lookup('hello/there/you/')

    assert.deepStrictEqual(result, {
      params: {},
      data: 'test'
    })

    assert.strictEqual(r.lookup('not/there'), null)
    assert.strictEqual(r.lookup('not-me'), null)
  })

  it('can insert data at the root', () => {
    const r = new Router<string>()

    r.insert('', 'hi')

    const result = r.lookup('/')

    assert.deepStrictEqual(result, {
      params: {},
      data: 'hi'
    })
  })

  it('can insert with placeholder and has proper specificity', () => {
    const r = new Router<string>()

    r.insert('/hello/:id', 'one')
    r.insert('/hello/:id/you', 'two')
    r.insert('/hello/:id/:other', 'three')

    const first = r.lookup('hello/there/')

    assert.throws(() => r.insert('/hello/:id/you', 'two'), {
      message: 'Path hello/:id/you already exists'
    })

    assert.deepStrictEqual(first, {
      params: { id: 'there' },
      data: 'one'
    })

    const second = r.lookup('hello/yes/you')

    assert.deepStrictEqual(second, {
      params: { id: 'yes' },
      data: 'two'
    })

    const third = r.lookup('hello/yes/they')

    assert.deepStrictEqual(third, {
      params: {
        id: 'yes',
        other: 'they'
      },
      data: 'three'
    })

    assert.strictEqual(r.lookup('hello/yes/they/here'), null)
  })

  it('works with different placeholders in different paths (#2327)', () => {
    const r = new Router<string>()

    r.insert('/hello/:id', 'one')
    r.insert('/hello/:test/you', 'two')
    r.insert('/hello/:test/:two/hi/:three', 'three')
    r.insert('/hello/:test/:two/hi', 'four')

    assert.deepStrictEqual(r.lookup('/hello/there'), {
      params: { id: 'there' },
      data: 'one'
    })
    assert.deepStrictEqual(r.lookup('/hello/there/you'), {
      params: { test: 'there' },
      data: 'two'
    })
    assert.strictEqual(r.lookup('/hello/there/bla'), null)
    assert.deepStrictEqual(r.lookup('/hello/there/maybe/hi'), {
      params: { test: 'there', two: 'maybe' },
      data: 'four'
    })
    assert.deepStrictEqual(r.lookup('/hello/there/maybe/hi/test'), {
      params: { three: 'test', two: 'maybe', test: 'there' },
      data: 'three'
    })
  })

  it('can remove paths (#2035)', () => {
    const r = new Router<string>()

    r.insert('/hello/:id', 'one')
    r.insert('/hello/:test/you', 'two')
    r.insert('/hello/here/thing', 'else')

    assert.deepStrictEqual(r.lookup('hello/there'), { params: { id: 'there' }, data: 'one' })

    r.remove('/hello/:id')

    assert.deepStrictEqual(r.lookup('hello/here/you'), { params: { test: 'here' }, data: 'two' })
    assert.deepStrictEqual(r.lookup('hello/here/thing'), { params: {}, data: 'else' })
    assert.strictEqual(r.lookup('hello/there'), null)

    r.remove('/hello/:test/you')
    assert.deepStrictEqual(r.lookup('hello/here/you'), null)
    assert.deepStrictEqual(r.lookup('hello/here/thing'), { params: {}, data: 'else' })

    r.remove('/hello/here/thing')
    assert.ok(!r.root.hasChildren)
  })
})
