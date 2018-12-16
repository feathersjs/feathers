const assert = require('assert');
const { NotImplemented } = require('@feathersjs/errors');
const { AdapterService } = require('../lib');

class CustomService extends AdapterService {
  _find () {
    return Promise.resolve([]);
  }
}

describe('@feathersjs/adapter-commons/service', () => {
  it('calls methods', () => {
    const service = new CustomService();

    return service.find().then(result => {
      assert.deepStrictEqual(result, []);
    });
  });

  it('throw an error if method does not exist', () => {
    const service = new CustomService();

    return service.create().then(() => {
      throw new Error('Should never get here');
    }).catch(error => {
      assert.ok(error instanceof NotImplemented);
      assert.strictEqual(error.message, 'Method _create not available');
    });
  });

  it('getFilters', () => {
    const service = new CustomService();
    const filtered = service.filterQuery({
      query: { $limit: 10, test: 'me' }
    });

    assert.deepStrictEqual(filtered, {
      filters: { $limit: 10 },
      query: { test: 'me' }
    });
  });
});
