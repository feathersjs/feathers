import { strict as assert } from 'assert'
import { createDebug, setDebug, noopDebug } from '../src/index'

const myDebug = createDebug('hello test')

describe('debug', () => {
  it('default debug does nothing', () => {
    assert.equal(myDebug('hi', 'there'), undefined)
  })

  it('can set custom debug later', () => {
    let call

    const customDebug =
      (name: string) =>
      (...args: any[]) => {
        call = [name].concat(args)
      }

    setDebug(customDebug)

    assert.equal(myDebug('hi', 'there'), undefined)
    assert.deepEqual(call, ['hello test', 'hi', 'there'])

    const newDebug = createDebug('other test')

    assert.equal(newDebug('other', 'there'), undefined)
    assert.deepEqual(call, ['other test', 'other', 'there'])

    setDebug(noopDebug)
  })
})
