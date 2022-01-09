import assert from 'assert';
import { HookContext } from '@feathersjs/feathers';
import { http } from '../src';

describe('@feathersjs/transport-commons HTTP helpers', () => {
  it('getData', () => {
    const plainData = { message: 'hi' };
    const dispatch = { message: 'from dispatch' };
    const resultContext = {
      result: plainData
    };
    const dispatchContext = {
      dispatch
    };

    assert.strictEqual(http.getData(resultContext as HookContext), plainData);
    assert.strictEqual(http.getData(dispatchContext as HookContext), dispatch);
  });

  it('getStatusCode', () => {
    const statusContext = {
      http: { statusCode: 202 }
    };
    const createContext = {
      method: 'create'
    };

    assert.strictEqual(http.getStatusCode(statusContext as HookContext, {}), 202);
    assert.strictEqual(http.getStatusCode(createContext as HookContext, {}), http.statusCodes.created);
    assert.strictEqual(http.getStatusCode({} as HookContext), http.statusCodes.noContent);
    assert.strictEqual(http.getStatusCode({} as HookContext, {}), http.statusCodes.success);
  });

  it('getServiceMethod', () => {
    assert.strictEqual(http.getServiceMethod('GET', 2), 'get');
    assert.strictEqual(http.getServiceMethod('GET', null), 'find');
    assert.strictEqual(http.getServiceMethod('PoST', null), 'create');
    assert.strictEqual(http.getServiceMethod('PoST', null, 'customMethod'), 'customMethod');
    assert.strictEqual(http.getServiceMethod('delete', null), 'remove');
    assert.throws(() => http.getServiceMethod('nonsense', null));
  });

  it('getResponseHeaders', () => {
    const responseHeaders = { key: 'value' };
    const headersContext = {
      http: { responseHeaders }
    };

    assert.deepStrictEqual(http.getResponseHeaders({} as HookContext), {});
    assert.deepStrictEqual(http.getResponseHeaders({http: {}} as HookContext), {});
    assert.strictEqual(http.getResponseHeaders(headersContext as any as HookContext), responseHeaders);
  });
});
