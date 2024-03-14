import assert from 'assert'
import { HookContext } from '@feathersjs/feathers'
import { http } from '../src'

describe('@feathersjs/transport-commons HTTP helpers', () => {
  it('getResponse body', () => {
    const plainData = { message: 'hi' }
    const dispatch = { message: 'from dispatch' }
    const resultContext = {
      result: plainData
    }
    const dispatchContext = {
      dispatch
    }

    assert.strictEqual(http.getResponse(resultContext as HookContext).body, plainData)
    assert.strictEqual(http.getResponse(dispatchContext as HookContext).body, dispatch)
  })

  it('getResponse status', () => {
    const statusContext = {
      http: { status: 202 }
    }
    const createContext = {
      method: 'create'
    }
    const redirectContext = {
      http: { location: '/' }
    }

    assert.strictEqual(http.getResponse(statusContext as HookContext).status, 202)
    assert.strictEqual(http.getResponse(createContext as HookContext).status, http.statusCodes.created)
    assert.strictEqual(http.getResponse(redirectContext as HookContext).status, http.statusCodes.seeOther)
    assert.strictEqual(http.getResponse({} as HookContext).status, http.statusCodes.noContent)
    assert.strictEqual(http.getResponse({ result: true } as HookContext).status, http.statusCodes.success)
  })

  it('getResponse headers', () => {
    const headers = { key: 'value' } as any
    const headersContext = {
      http: { headers }
    }
    const locationContext = {
      http: { location: '/' }
    }

    assert.deepStrictEqual(http.getResponse({} as HookContext).headers, {})
    assert.deepStrictEqual(http.getResponse({ http: {} } as HookContext).headers, {})
    assert.strictEqual(http.getResponse(headersContext as HookContext).headers, headers)
    assert.deepStrictEqual(http.getResponse(locationContext as HookContext).headers, {
      Location: '/'
    })
  })

  // it('getServiceMethod', () => {
  //   assert.strictEqual(http.getServiceMethod('GET', 2, null), 'get')
  //   assert.strictEqual(http.getServiceMethod('GET', null, null), 'find')
  //   assert.strictEqual(http.getServiceMethod('PoST', null, null), 'create')
  //   assert.strictEqual(http.getServiceMethod('PoST', null, 'customMethod'), 'customMethod')
  //   assert.strictEqual(http.getServiceMethod('delete', null, null), 'remove')
  //   assert.throws(() => http.getServiceMethod('nonsense', null, null))
  // })
})
