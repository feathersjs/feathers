import { strict as assert } from 'assert';
import { verify } from '@feathersjs/tests';

export default (name: string, options: any) => {
  const call = (method: string, ...args: any[]) =>
    new Promise((resolve, reject) => {
      const { socket } = options;
      const prefix = [method, name];
      const emitArgs = prefix.concat(args);

      socket.emit(...emitArgs, (error: any, result: any) =>
        error ? reject(error) : resolve(result)
      );
    });

  it('invalid arguments cause an error', () =>
    call('find', 1, {}).catch(e =>
      assert.strictEqual(e.message, 'Too many arguments for \'find\' method')
    )
  );

  it('.find', () => async () => {
    await call('find', {}).then(data => verify.find(data));
  });

  it('.get', () => async () => {
    await call('get', 'laundry').then(data => verify.get('laundry', data));
  });

  it('.get with error', () => async () => {
    try {
      await call('get', 'laundry', { error: true });
      assert.fail('Should never get here');
    } catch (error) {
      assert.strictEqual(error.message, 'Something for laundry went wrong');
    }
  });

  it('.get with runtime error', () => async () => {
    try {
      await call('get', 'laundry', { runtimeError: true });
      assert.fail('Should never get here');
    } catch (error) {
      assert.strictEqual(error.message, 'thingThatDoesNotExist is not defined')
    }
  });

  it('.get with error in hook', () => async () => {
    try {
      await call('get', 'laundry', { hookError: true });
      assert.fail('Should never get here');
    } catch (error) {
      assert.strictEqual(error.message, 'Error from get, before hook');
    }
  });

  it('.create', async () => {
    const original = {
      name: 'creating'
    };

    const data = await call('create', original, {});

    verify.create(original, data);
  });

  it('.create without parameters', async () => {
    const original = {
      name: 'creating again'
    };

    const data = await call('create', original);

    verify.create(original, data);
  });

  it('.update', async () => {
    const original = {
      name: 'updating'
    };

    const data = await call('update', 23, original, {});

    verify.update(23, original, data);
  });

  it('.update many', async () => {
    const original = {
      name: 'updating',
      many: true
    };

    const data = await call('update', null, original);

    verify.update(null, original, data);
  });

  it('.patch', async () => {
    const original = {
      name: 'patching'
    };

    const data = await call('patch', 25, original);

    verify.patch(25, original, data);
  });

  it('.patch many', async () => {
    const original = {
      name: 'patching',
      many: true
    };

    const data = await call('patch', null, original);

    verify.patch(null, original, data);
  });

  it('.remove', () => async () => {
    const data = await call('remove', 11);

    verify.remove(11, data);
  });

  it('.remove many', async () => {
    const data = await call('remove', null);

    verify.remove(null, data);
  });
};
