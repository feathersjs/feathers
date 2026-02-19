import { describe, it } from 'vitest'
import assert from 'assert'
import { parse, stringify } from './qs.js'

describe('qs', () => {
  // ---------------------------------------------------------------------------
  // parse — basic
  // ---------------------------------------------------------------------------
  describe('parse', () => {
    it('parses a simple string', () => {
      assert.deepStrictEqual(parse('0=foo'), { '0': 'foo' })
      assert.deepStrictEqual(parse('foo=c++'), { foo: 'c  ' })
      assert.deepStrictEqual(parse('a[>=]=23'), { a: { '>=': '23' } })
      assert.deepStrictEqual(parse('a[<=>]==23'), { a: { '<=>': '=23' } })
      assert.deepStrictEqual(parse('a[==]=23'), { a: { '==': '23' } })
      assert.deepStrictEqual(parse('foo'), { foo: '' })
      assert.deepStrictEqual(parse('foo='), { foo: '' })
      assert.deepStrictEqual(parse('foo=bar'), { foo: 'bar' })
      assert.deepStrictEqual(parse(' foo = bar = baz '), { ' foo ': ' bar = baz ' })
      assert.deepStrictEqual(parse('foo=bar=baz'), { foo: 'bar=baz' })
      assert.deepStrictEqual(parse('foo=bar&bar=baz'), { foo: 'bar', bar: 'baz' })
      assert.deepStrictEqual(parse('foo2=bar2&baz2='), { foo2: 'bar2', baz2: '' })
      assert.deepStrictEqual(parse('foo=bar&baz'), { foo: 'bar', baz: '' })
      assert.deepStrictEqual(parse('cht=p3&chd=t:60,40&chs=250x100&chl=Hello|World'), {
        cht: 'p3',
        chd: 't:60,40',
        chs: '250x100',
        chl: 'Hello|World'
      })
    })

    it('parses a single nested string', () => {
      assert.deepStrictEqual(parse('a[b]=c'), { a: { b: 'c' } })
    })

    it('parses a double nested string', () => {
      assert.deepStrictEqual(parse('a[b][c]=d'), { a: { b: { c: 'd' } } })
    })

    it('defaults to a depth of 5', () => {
      assert.deepStrictEqual(parse('a[b][c][d][e][f][g][h]=i'), {
        a: { b: { c: { d: { e: { '[f][g][h]': 'i' } } } } }
      })
    })

    it('parses a simple array', () => {
      assert.deepStrictEqual(parse('a=b&a=c'), { a: ['b', 'c'] })
    })

    it('parses an explicit array', () => {
      assert.deepStrictEqual(parse('a[]=b'), { a: ['b'] })
      assert.deepStrictEqual(parse('a[]=b&a[]=c'), { a: ['b', 'c'] })
      assert.deepStrictEqual(parse('a[]=b&a[]=c&a[]=d'), { a: ['b', 'c', 'd'] })
    })

    it('allows specifying array indices', () => {
      assert.deepStrictEqual(parse('a[1]=c&a[0]=b&a[2]=d'), { a: ['b', 'c', 'd'] })
      assert.deepStrictEqual(parse('a[1]=c&a[0]=b'), { a: ['b', 'c'] })
      assert.deepStrictEqual(parse('a[1]=c'), { a: ['c'] })
    })

    it('parses a nested array', () => {
      assert.deepStrictEqual(parse('a[b][]=c&a[b][]=d'), { a: { b: ['c', 'd'] } })
      assert.deepStrictEqual(parse('a[>=]=25'), { a: { '>=': '25' } })
    })

    it('parses arrays of objects', () => {
      assert.deepStrictEqual(parse('a[][b]=c'), { a: [{ b: 'c' }] })
      assert.deepStrictEqual(parse('a[0][b]=c'), { a: [{ b: 'c' }] })
    })

    it('allows empty strings in arrays', () => {
      assert.deepStrictEqual(parse('a[]=b&a[]=&a[]=c'), { a: ['b', '', 'c'] })
      assert.deepStrictEqual(parse('a[]=&a[]=b&a[]=c'), { a: ['', 'b', 'c'] })
    })

    it('compacts sparse arrays', () => {
      assert.deepStrictEqual(parse('a[10]=1&a[2]=2'), { a: ['2', '1'] })
    })

    it('supports keys that begin with a number', () => {
      assert.deepStrictEqual(parse('a[12b]=c'), { a: { '12b': 'c' } })
    })

    it('treats negative indices as object keys', () => {
      assert.deepStrictEqual(parse('a[-1]=v'), { a: { '-1': 'v' } })
    })

    it('treats leading-zero indices as object keys', () => {
      assert.deepStrictEqual(parse('a[01]=v'), { a: { '01': 'v' } })
    })

    it('handles double empty brackets as nested arrays', () => {
      assert.deepStrictEqual(parse('a[][]=v'), { a: [['v']] })
    })

    it('decodes + as space in keys', () => {
      assert.deepStrictEqual(parse('a+b=c'), { 'a b': 'c' })
    })

    it('supports encoded = signs', () => {
      assert.deepStrictEqual(parse('he%3Dllo=th%3Dere'), { 'he=llo': 'th=ere' })
    })

    it('is ok with url-encoded strings', () => {
      assert.deepStrictEqual(parse('a[b%20c]=d'), { a: { 'b c': 'd' } })
      assert.deepStrictEqual(parse('a[b]=c%20d'), { a: { b: 'c d' } })
    })

    it('allows brackets in the value', () => {
      assert.deepStrictEqual(parse('pets=["tobi"]'), { pets: '["tobi"]' })
      assert.deepStrictEqual(parse('operators=[">=", "<="]'), { operators: '[">=", "<="]' })
    })

    it('allows empty values', () => {
      assert.deepStrictEqual(parse(''), {})
    })

    it('supports malformed uri characters', () => {
      assert.deepStrictEqual(parse('{%:%}='), { '{%:%}': '' })
      assert.deepStrictEqual(parse('foo=%:%}'), { foo: '%:%}' })
    })

    it('does not produce empty keys', () => {
      assert.deepStrictEqual(parse('_r=1&'), { _r: '1' })
    })

    it('parses jquery-param strings', () => {
      const encoded =
        'filter%5B0%5D%5B%5D=int1&filter%5B0%5D%5B%5D=%3D&filter%5B0%5D%5B%5D=77&filter%5B%5D=and&filter%5B2%5D%5B%5D=int2&filter%5B2%5D%5B%5D=%3D&filter%5B2%5D%5B%5D=8'
      const expected = { filter: [['int1', '=', '77'], 'and', ['int2', '=', '8']] }
      assert.deepStrictEqual(parse(encoded), expected)
    })

    it('continues parsing when no parent is found', () => {
      assert.deepStrictEqual(parse('[foo]=bar'), { foo: 'bar' })
    })

    it('does not error when parsing a very long array', () => {
      let str = 'a[]=a'
      for (let i = 0; i < 15; i++) {
        str = str + '&' + str
      }
      assert.doesNotThrow(() => {
        parse(str)
      })
    })

    it('transforms arrays to objects when mixed with non-numeric keys', () => {
      assert.deepStrictEqual(parse('foo[0]=bar&foo[bad]=baz'), {
        foo: { 0: 'bar', bad: 'baz' }
      })
      assert.deepStrictEqual(parse('foo[bad]=baz&foo[0]=bar'), {
        foo: { bad: 'baz', 0: 'bar' }
      })
      assert.deepStrictEqual(parse('foo[bad]=baz&foo[]=bar'), {
        foo: { bad: 'baz', 0: 'bar' }
      })
      assert.deepStrictEqual(parse('foo[]=bar&foo[bad]=baz'), {
        foo: { 0: 'bar', bad: 'baz' }
      })
      assert.deepStrictEqual(parse('foo[bad]=baz&foo[]=bar&foo[]=foo'), {
        foo: { bad: 'baz', 0: 'bar', 1: 'foo' }
      })
    })

    it('parses arrays of objects with indices', () => {
      assert.deepStrictEqual(parse('a[0][a]=a&a[0][b]=b&a[1][a]=aa&a[1][b]=bb'), {
        a: [
          { a: 'a', b: 'b' },
          { a: 'aa', b: 'bb' }
        ]
      })
    })

    it('params starting with a closing bracket', () => {
      assert.deepStrictEqual(parse(']=toString'), { ']': 'toString' })
      assert.deepStrictEqual(parse(']]=toString'), { ']]': 'toString' })
      assert.deepStrictEqual(parse(']hello]=toString'), { ']hello]': 'toString' })
    })

    it('params starting with an opening bracket', () => {
      assert.deepStrictEqual(parse('[=toString'), { '[': 'toString' })
      assert.deepStrictEqual(parse('[[=toString'), { '[[': 'toString' })
      assert.deepStrictEqual(parse('[hello[=toString'), { '[hello[': 'toString' })
    })

    // -----------------------------------------------------------------------
    // parse — depth limit
    // -----------------------------------------------------------------------
    describe('depth limit', () => {
      it('collapses beyond depth 5 into literal key', () => {
        assert.deepStrictEqual(parse('a[b][c][d][e][f][g][h]=i'), {
          a: { b: { c: { d: { e: { '[f][g][h]': 'i' } } } } }
        })
      })

      it('handles exactly at depth limit', () => {
        // depth 5: a → b → c → d → e (5 segments)
        assert.deepStrictEqual(parse('a[b][c][d][e]=v'), {
          a: { b: { c: { d: { e: 'v' } } } }
        })
      })

      it('handles one over depth limit', () => {
        // depth 6: a → b → c → d → e → [f] collapses
        assert.deepStrictEqual(parse('a[b][c][d][e][f]=v'), {
          a: { b: { c: { d: { e: { '[f]': 'v' } } } } }
        })
      })
    })

    // -----------------------------------------------------------------------
    // parse — parameter limit
    // -----------------------------------------------------------------------
    describe('parameter limit', () => {
      it('silently drops pairs beyond 2000', () => {
        const pairs: string[] = []
        for (let i = 0; i < 2001; i++) {
          pairs.push(`k${i}=v${i}`)
        }
        const result = parse(pairs.join('&'))
        assert.strictEqual(Object.keys(result).length, 2000)
        assert.strictEqual(result.k0, 'v0')
        assert.strictEqual(result.k1999, 'v1999')
        assert.strictEqual(result.k2000, undefined)
      })
    })

    // -----------------------------------------------------------------------
    // parse — security: prototype pollution
    // -----------------------------------------------------------------------
    describe('prototype pollution protection', () => {
      it('ignores __proto__ keys', () => {
        parse('__proto__[polluted]=yes')
        assert.strictEqual((Object.prototype as any).polluted, undefined)
      })

      it('ignores nested __proto__ keys', () => {
        const result = parse('a[__proto__][polluted]=yes')
        assert.strictEqual((Object.prototype as any).polluted, undefined)
        assert.deepStrictEqual(result, {})
      })

      it('ignores constructor keys', () => {
        parse('constructor[prototype][bad]=bad')
        assert.strictEqual((Object.prototype as any).bad, undefined)
      })

      it('ignores nested constructor keys', () => {
        const result = parse('bad[constructor][prototype][bad]=bad')
        assert.strictEqual((Object.prototype as any).bad, undefined)
        assert.deepStrictEqual(result, {})
      })

      it('ignores prototype keys', () => {
        const result = parse('a[prototype]=b')
        assert.deepStrictEqual(result, {})
      })

      it('silently drops entire path when any segment is unsafe', () => {
        const result = parse('a[b][__proto__][c]=d')
        assert.deepStrictEqual(result, {})
        assert.strictEqual((Object.prototype as any).c, undefined)
      })

      it('parses safe keys alongside unsafe ones', () => {
        const result = parse('safe=ok&__proto__[bad]=no&also=fine')
        assert.deepStrictEqual(result, { safe: 'ok', also: 'fine' })
        assert.strictEqual((Object.prototype as any).bad, undefined)
      })

      it('ignores __proto__ as a top-level key', () => {
        const result = parse('__proto__=value')
        assert.deepStrictEqual(result, {})
      })

      it('handles dunder proto payload', () => {
        const result = parse(
          'categories[__proto__]=login&categories[__proto__]&categories[length]=42'
        )
        // Paths containing __proto__ are dropped, but safe sibling paths survive
        assert.deepStrictEqual(result, { categories: { length: '42' } })
      })
    })

    // -----------------------------------------------------------------------
    // parse — security: array index overflow
    // -----------------------------------------------------------------------
    describe('array index overflow protection', () => {
      it('drops indices >= 2000', () => {
        const result = parse('a[2000]=v')
        assert.deepStrictEqual(result, {})
      })

      it('drops very large indices', () => {
        const result = parse('a[999999]=v')
        assert.deepStrictEqual(result, {})
      })

      it('does not create empty parent shells for out-of-range indices', () => {
        const result = parse('a[2000]=v')
        assert.strictEqual(result.a, undefined)
      })

      it('keeps indices below the limit', () => {
        const result = parse('a[1999]=v')
        assert.ok(Array.isArray(result.a))
        assert.strictEqual(result.a[0], 'v')
      })

      it('drops entire pair when nested path has out-of-range index', () => {
        const result = parse('a[b][2000]=v')
        assert.deepStrictEqual(result, {})
      })

      it('mixes valid and out-of-range indices', () => {
        const result = parse('a[0]=ok&a[2000]=dropped')
        assert.deepStrictEqual(result, { a: ['ok'] })
      })
    })

    // -----------------------------------------------------------------------
    // parse — Feathers query patterns
    // -----------------------------------------------------------------------
    describe('Feathers query patterns', () => {
      it('parses $limit and $skip', () => {
        assert.deepStrictEqual(parse('$limit=10&$skip=20'), {
          $limit: '10',
          $skip: '20'
        })
      })

      it('parses $sort with bracket notation', () => {
        assert.deepStrictEqual(parse('$sort[name]=1'), {
          $sort: { name: '1' }
        })
      })

      it('parses nested $in queries', () => {
        assert.deepStrictEqual(parse('test[$in][0]=a&test[$in][1]=b&test[$in][2]=c'), {
          test: { $in: ['a', 'b', 'c'] }
        })
      })

      it('parses complex Feathers query', () => {
        const qs = '$limit=10&$sort[createdAt]=-1&status[$in][0]=active&status[$in][1]=pending'
        assert.deepStrictEqual(parse(qs), {
          $limit: '10',
          $sort: { createdAt: '-1' },
          status: { $in: ['active', 'pending'] }
        })
      })
    })
  })

  // ---------------------------------------------------------------------------
  // stringify — basic
  // ---------------------------------------------------------------------------
  describe('stringify', () => {
    it('stringifies a querystring object', () => {
      assert.strictEqual(stringify({ a: 'b' }), 'a=b')
      assert.strictEqual(stringify({ a: 1 }), 'a=1')
      assert.strictEqual(stringify({ a: 1, b: 2 }), 'a=1&b=2')
      assert.strictEqual(stringify({ a: 'A_Z' }), 'a=A_Z')
    })

    it('stringifies falsy values', () => {
      assert.strictEqual(stringify(undefined as any), '')
      assert.strictEqual(stringify(null as any), '')
      assert.strictEqual(stringify(false as any), '')
      assert.strictEqual(stringify(0 as any), '')
    })

    it('stringifies nested objects with bracket notation', () => {
      assert.strictEqual(stringify({ a: { b: 'c' } }), 'a%5Bb%5D=c')
    })

    it('stringifies deeply nested objects', () => {
      assert.strictEqual(
        stringify({ a: { b: { c: 'd' } } }),
        'a%5Bb%5D%5Bc%5D=d'
      )
    })

    it('stringifies arrays with indexed bracket notation', () => {
      assert.strictEqual(stringify({ a: ['b', 'c'] }), 'a%5B0%5D=b&a%5B1%5D=c')
    })

    it('stringifies nested arrays in objects', () => {
      assert.strictEqual(
        stringify({ a: { b: ['c', 'd'] } }),
        'a%5Bb%5D%5B0%5D=c&a%5Bb%5D%5B1%5D=d'
      )
    })

    it('handles null values', () => {
      assert.strictEqual(stringify({ a: null }), 'a=')
    })

    it('skips undefined values', () => {
      assert.strictEqual(stringify({ a: undefined }), '')
      assert.strictEqual(stringify({ a: 'b', c: undefined }), 'a=b')
    })

    it('stringifies boolean values', () => {
      assert.strictEqual(stringify({ a: true }), 'a=true')
      assert.strictEqual(stringify({ a: false }), 'a=false')
    })

    it('stringifies number values', () => {
      assert.strictEqual(stringify({ a: 0 }), 'a=0')
      assert.strictEqual(stringify({ a: 42 }), 'a=42')
    })

    it('returns empty string for empty objects', () => {
      assert.strictEqual(stringify({}), '')
    })

    it('omits empty arrays', () => {
      assert.strictEqual(stringify({ a: [] }), '')
      assert.strictEqual(stringify({ a: 'b', c: [] }), 'a=b')
    })

    it('encodes special characters', () => {
      assert.strictEqual(stringify({ a: 'hello world' }), 'a=hello%20world')
      assert.strictEqual(stringify({ 'a b': 'c' }), 'a%20b=c')
    })

    it('stringifies arrays as top-level input', () => {
      assert.strictEqual(stringify(['a', 'b']), '0=a&1=b')
    })

    it('stops at depth limit', () => {
      const deep = { a: { b: { c: { d: { e: { f: 'too deep' } } } } } }
      const result = stringify(deep)
      // depth 1:a → 2:b → 3:c → 4:d → 5:e → 6:f exceeds limit, f is dropped
      assert.ok(!result.includes('too%20deep'))
    })

    // -----------------------------------------------------------------------
    // stringify — Feathers query patterns
    // -----------------------------------------------------------------------
    describe('Feathers query patterns', () => {
      it('stringifies $sort', () => {
        const result = stringify({ $sort: { name: 1 } })
        assert.strictEqual(result, '%24sort%5Bname%5D=1')
      })

      it('stringifies $in arrays', () => {
        const result = stringify({ status: { $in: ['active', 'pending'] } })
        assert.strictEqual(
          result,
          'status%5B%24in%5D%5B0%5D=active&status%5B%24in%5D%5B1%5D=pending'
        )
      })

      it('stringifies complex Feathers query', () => {
        const query = {
          $limit: 10,
          $sort: { createdAt: -1 },
          status: { $in: ['active', 'pending'] }
        }
        const result = stringify(query)
        assert.ok(result.includes('%24limit=10'))
        assert.ok(result.includes('%24sort%5BcreatedAt%5D=-1'))
        assert.ok(result.includes('status%5B%24in%5D%5B0%5D=active'))
        assert.ok(result.includes('status%5B%24in%5D%5B1%5D=pending'))
      })
    })
  })

  // ---------------------------------------------------------------------------
  // round-trip
  // ---------------------------------------------------------------------------
  describe('round-trip', () => {
    it('round-trips flat values (as strings)', () => {
      const query = { name: 'Alice', age: 30, active: true }
      const result = parse(stringify(query))
      assert.deepStrictEqual(result, { name: 'Alice', age: '30', active: 'true' })
    })

    it('round-trips nested objects', () => {
      const query = { a: { b: 'c' } }
      assert.deepStrictEqual(parse(stringify(query)), { a: { b: 'c' } })
    })

    it('round-trips arrays', () => {
      const query = { ids: ['1', '2', '3'] }
      assert.deepStrictEqual(parse(stringify(query)), { ids: ['1', '2', '3'] })
    })

    it('round-trips nested arrays in objects', () => {
      const query = { a: { b: ['c', 'd'] } }
      assert.deepStrictEqual(parse(stringify(query)), { a: { b: ['c', 'd'] } })
    })

    it('round-trips complex Feathers queries', () => {
      const query = {
        $limit: 10,
        $sort: { createdAt: -1 },
        status: { $in: ['active', 'pending'] }
      }
      const result = parse(stringify(query))
      assert.deepStrictEqual(result, {
        $limit: '10',
        $sort: { createdAt: '-1' },
        status: { $in: ['active', 'pending'] }
      })
    })

    it('round-trips arrays of objects', () => {
      const query = { items: [{ a: '1' }, { a: '2' }] }
      assert.deepStrictEqual(parse(stringify(query)), query)
    })

    it('round-trips Feathers $in query from client', () => {
      const query = { test: { $in: ['0', '1', '2'] }, returnquery: 'true' }
      assert.deepStrictEqual(parse(stringify(query)), query)
    })
  })
})
