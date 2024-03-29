import { strict as assert } from 'assert'
import { NotFound } from '@feathersjs/errors'

import { notFound } from '../src'

const handler = notFound as any

describe('not-found-handler', () => {
  it('returns NotFound error', (done) => {
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
        done()
      }
    )
  })

  it('returns NotFound error with URL when verbose', (done) => {
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
        done()
      }
    )
  })
})
