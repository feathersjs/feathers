/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment */
import assert from 'assert'
import { MethodService } from './fixture'

const METHODS: ['find', 'get', 'create', 'update', 'patch', 'remove'] = [
  'find',
  'get',
  'create',
  'update',
  'patch',
  'remove'
]

describe('@feathersjs/adapter-commons/service', () => {
  describe('works when methods exist', () => {
    METHODS.forEach((method) => {
      it(`${method}`, () => {
        const service = new MethodService({})
        const args = []

        if (method !== 'find') {
          args.push('test')
        }

        if (method === 'update' || method === 'patch') {
          args.push({})
        }

        // @ts-ignore
        return service[method](...args)
      })
    })

    it('does not allow multi patch', async () => {
      const service = new MethodService({})

      await assert.rejects(() => service.patch(null, {}), {
        name: 'MethodNotAllowed',
        message: 'Can not patch multiple entries'
      })
    })

    it('does not allow multi remove', async () => {
      const service = new MethodService({})

      await assert.rejects(() => service.remove(null, {}), {
        name: 'MethodNotAllowed',
        message: 'Can not remove multiple entries'
      })
    })

    it('does not allow multi create', async () => {
      const service = new MethodService({})

      await assert.rejects(() => service.create([], {}), {
        name: 'MethodNotAllowed',
        message: 'Can not create multiple entries'
      })
    })

    it('multi can be set to true', async () => {
      const service = new MethodService({})

      service.options.multi = true

      await service.create([])
    })
  })

  it('sanitizeQuery', async () => {
    const service = new MethodService({
      filters: {
        $something: true
      },
      operators: ['$test']
    })

    assert.deepStrictEqual(
      await service.sanitizeQuery({
        query: { $limit: '10', test: 'me' } as any
      }),
      { $limit: 10, test: 'me' }
    )

    assert.deepStrictEqual(
      await service.sanitizeQuery({
        adapter: {
          paginate: { max: 2 }
        },
        query: { $limit: '10', test: 'me' } as any
      }),
      { $limit: 2, test: 'me' }
    )

    await assert.rejects(
      () =>
        service.sanitizeQuery({
          query: { name: { $bla: 'me' } }
        }),
      {
        message: 'Invalid query parameter $bla'
      }
    )

    assert.deepStrictEqual(
      await service.sanitizeQuery({
        adapter: {
          operators: ['$bla']
        },
        query: { name: { $bla: 'Dave' } }
      }),
      { name: { $bla: 'Dave' } }
    )
  })

  it('getOptions', () => {
    const service = new MethodService({
      multi: true,
      paginate: {
        default: 1,
        max: 10
      }
    })
    const opts = service.getOptions({
      adapter: {
        multi: ['create'],
        paginate: {
          default: 10,
          max: 100
        }
      }
    })

    assert.deepStrictEqual(opts, {
      id: 'id',
      events: [],
      paginate: { default: 10, max: 100 },
      multi: ['create'],
      filters: {},
      operators: []
    })

    const notPaginated = service.getOptions({
      paginate: false
    })

    assert.deepStrictEqual(notPaginated, {
      id: 'id',
      events: [],
      paginate: false,
      multi: true,
      filters: {},
      operators: []
    })
  })

  it('allowsMulti', () => {
    context('with true', () => {
      const service = new MethodService({ multi: true })

      it('does return true for multiple methodes', () => {
        assert.equal(service.allowsMulti('patch'), true)
      })

      it('does return false for always non-multiple methodes', () => {
        assert.equal(service.allowsMulti('update'), false)
      })

      it('does return true for unknown methods', () => {
        assert.equal(service.allowsMulti('other'), true)
      })
    })

    context('with false', () => {
      const service = new MethodService({ multi: false })

      it('does return false for multiple methodes', () => {
        assert.equal(service.allowsMulti('remove'), false)
      })

      it('does return true for always multiple methodes', () => {
        assert.equal(service.allowsMulti('find'), true)
      })

      it('does return false for unknown methods', () => {
        assert.equal(service.allowsMulti('other'), false)
      })
    })

    context('with array', () => {
      const service = new MethodService({ multi: ['create', 'get', 'other'] })

      it('does return true for specified multiple methodes', () => {
        assert.equal(service.allowsMulti('create'), true)
      })

      it('does return false for non-specified multiple methodes', () => {
        assert.equal(service.allowsMulti('patch'), false)
      })

      it('does return false for specified always multiple methodes', () => {
        assert.equal(service.allowsMulti('get'), false)
      })

      it('does return true for specified unknown methodes', () => {
        assert.equal(service.allowsMulti('other'), true)
      })

      it('does return false for non-specified unknown methodes', () => {
        assert.equal(service.allowsMulti('another'), false)
      })
    })
  })
})
