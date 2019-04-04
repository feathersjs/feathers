import assert from 'assert';

const findAllData = [{
  id: 0,
  description: 'You have to do something'
}, {
  id: 1,
  description: 'You have to do laundry'
}];

exports.Service = {
  events: [ 'log' ],

  find () {
    return Promise.resolve(findAllData);
  },

  get (name: string, params: any) {
    if (params.query.error) {
      return Promise.reject(new Error(`Something for ${name} went wrong`));
    }

    if (params.query.runtimeError) {
      // @ts-ignore
      thingThatDoesNotExist(); // eslint-disable-line
    }

    return Promise.resolve({
      id: name,
      description: `You have to do ${name}!`
    });
  },

  create (data: any) {
    const result = Object.assign({}, data, {
      id: 42,
      status: 'created'
    });

    if (Array.isArray(data)) {
      result.many = true;
    }

    return Promise.resolve(result);
  },

  update (id: any, data: any) {
    const result = Object.assign({}, data, {
      id, status: 'updated'
    });

    if (id === null) {
      result.many = true;
    }

    return Promise.resolve(result);
  },

  patch (id: any, data: any) {
    const result = Object.assign({}, data, {
      id, status: 'patched'
    });

    if (id === null) {
      result.many = true;
    }

    return Promise.resolve(result);
  },

  remove (id: any) {
    return Promise.resolve({ id });
  }
};

exports.verify = {
  find (data: any) {
    assert.deepStrictEqual(findAllData, data, 'Data as expected');
  },

  get (id: any, data: any) {
    assert.strictEqual(data.id, id, 'Got id in data');
    assert.strictEqual(data.description, `You have to do ${id}!`, 'Got description');
  },

  create (original: any, current: any) {
    const expected = Object.assign({}, original, {
      id: 42,
      status: 'created'
    });
    assert.deepStrictEqual(expected, current, 'Data ran through .create as expected');
  },

  update (id: any, original: any, current: any) {
    const expected = Object.assign({}, original, {
      id,
      status: 'updated'
    });
    assert.deepStrictEqual(expected, current, 'Data ran through .update as expected');
  },

  patch (id: any, original: any, current: any) {
    const expected = Object.assign({}, original, {
      id,
      status: 'patched'
    });
    assert.deepStrictEqual(expected, current, 'Data ran through .patch as expected');
  },

  remove (id: any, data: any) {
    assert.deepStrictEqual({ id }, data, '.remove called');
  }
};
