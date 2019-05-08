const assert = require('assert');
const { verify } = require('@feathersjs/tests/lib/fixture');

module.exports = function (name, options, legacy = false) {
  const call = (method, ...args) =>
    new Promise((resolve, reject) => {
      const { socket } = options;
      const prefix = legacy ? [ `${name}::${method}` ]
        : [ method, name ];
      const emitArgs = prefix.concat(args);

      socket.send(...emitArgs, (error, result) =>
        error ? reject(error) : resolve(result)
      );
    }
    );

  it(`invalid arguments cause an error`, () =>
    call('find', 1, {}).catch(e =>
      assert.strictEqual(e.message, 'Too many arguments for \'find\' method')
    )
  );

  it('.find', () =>
    call('find', {}).then(data => verify.find(data))
  );

  it('.get', () =>
    call('get', 'laundry').then(data => verify.get('laundry', data))
  );

  it('.get with error', () =>
    call('get', 'laundry', { error: true })
      .then(() => assert.ok(false, 'Should never get here'))
      .catch(error => assert.strictEqual(error.message, 'Something for laundry went wrong'))
  );

  it('.get with runtime error', () =>
    call('get', 'laundry', { runtimeError: true })
      .then(() => assert.ok(false, 'Should never get here'))
      .catch(error => assert.strictEqual(error.message, 'thingThatDoesNotExist is not defined'))
  );

  it('.get with error in hook', () =>
    call('get', 'laundry', { hookError: true })
      .then(() => assert.ok(false, 'Should never get here'))
      .catch(error => assert.strictEqual(error.message, 'Error from get, before hook'))
  );

  it(`.create`, () => {
    let original = {
      name: `creating`
    };

    return call('create', original, {})
      .then(data => verify.create(original, data));
  });

  it(`.create without parameters`, () => {
    let original = {
      name: `creating again`
    };

    return call('create', original)
      .then(data => verify.create(original, data));
  });

  it('.update', () => {
    let original = {
      name: 'updating'
    };

    return call('update', 23, original, {})
      .then(data => verify.update(23, original, data));
  });

  it('.update many', () => {
    const original = {
      name: `updating`,
      many: true
    };

    return call('update', null, original)
      .then(data => verify.update(null, original, data));
  });

  it('.patch', () => {
    let original = {
      name: `patching`
    };

    return call('patch', 25, original)
      .then(data => verify.patch(25, original, data));
  });

  it('.patch many', () => {
    let original = {
      name: `patching`,
      many: true
    };

    return call('patch', null, original)
      .then(data => verify.patch(null, original, data));
  });

  it('.remove', () =>
    call('remove', 11).then(data => verify.remove(11, data))
  );

  it('.remove many', () =>
    call('remove', null).then(data => verify.remove(null, data))
  );
};
