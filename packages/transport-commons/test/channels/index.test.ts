/* eslint-disable @typescript-eslint/no-empty-function */
import assert from 'assert'
import { feathers, channelUtils } from '@feathersjs/feathers'

describe('feathers-channels', () => {
  it('has app.channel', () => {
    const app = feathers()

    assert.strictEqual(typeof app.channel, 'function')
    assert.strictEqual(typeof (app as any)[channelUtils.CHANNELS], 'object')
    assert.strictEqual(app.channels.length, 0)
  })

  it('throws an error when called with nothing', () => {
    const app = feathers()

    try {
      app.channel()
      assert.ok(false, 'Should never get here')
    } catch (e: any) {
      assert.strictEqual(e.message, 'app.channel needs at least one channel name')
    }
  })

  it('does not add things to the service if `dispatch` exists', () => {
    const app = feathers().use('/test', {
      async setup() {},
      publish() {
        return this
      }
    } as any)

    const service: any = app.service('test')

    assert.ok(!service[channelUtils.PUBLISHERS])
  })
})
