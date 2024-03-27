import { strict as assert } from 'assert'
import { NotFound } from '@feathersjs/errors'

import { notFound } from '../src'

const handler = notFound as any

describe('not-found-handler', () => {
  it('returns NotFound error', () =>
    new Promise<void>((resolve) => {
      handler()(
        {
          url: 'some/where',
          headers: {}
        },
        {},
        function (error: any) {
          assert.ok(error instanceof NotFound)
          assert.equal(error.message, 'Page not found')
          assert.deepEqual(error.data, {
            url: 'some/where'
          })
          resolve()
        }
      )
    }))

  it('returns NotFound error with URL when verbose', () =>
    new Promise<void>((resolve) => {
      handler({ verbose: true })(
        {
          url: 'some/where',
          headers: {}
        },
        {},
        function (error: any) {
          assert.ok(error instanceof NotFound)
          assert.equal(error.message, 'Page not found: some/where')
          assert.deepEqual(error.data, {
            url: 'some/where'
          })
          resolve()
        }
      )
    }))
})
