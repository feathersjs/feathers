const assert = require('assert');

module.exports = (test, app, errors, serviceName, idProp) => {
  describe(' Methods', () => {
    let doug, service;

    beforeEach(async () => {
      service = app.service(serviceName);
      doug = await app.service(serviceName).create({
        name: 'Doug',
        age: 32
      });
    });

    afterEach(async () => {
      try {
        await app.service(serviceName).remove(doug[idProp]);
      } catch (error) {}
    });

    describe('get', () => {
      it('.get', async () => {
        const data = await service.get(doug[idProp]);

        assert.strictEqual(data[idProp].toString(), doug[idProp].toString(),
          `${idProp} id matches`
        );
        assert.strictEqual(data.name, 'Doug', 'data.name matches');
        assert.strictEqual(data.age, 32, 'data.age matches');
      });

      test('.get + $select', async () => {
        const data = await service.get(doug[idProp], {
          query: { $select: [ 'name' ] }
        });

        assert.strictEqual(data[idProp].toString(), doug[idProp].toString(),
          `${idProp} id property matches`
        );
        assert.strictEqual(data.name, 'Doug', 'data.name matches');
        assert.strictEqual(data.age, undefined, 'data.age is undefined');
      });

      test('.get + query', async () => {
        try {
          await service.get(doug[idProp], {
            query: { name: 'Tester' }
          });
          throw new Error('Should never get here');
        } catch (error) {
          assert.ok(error instanceof errors.NotFound,
            'Got a NotFound Feathers error'
          );
        }
      });

      test('.get + NotFound', async () => {
        try {
          await service.get('568225fbfe21222432e836ff');
          throw new Error('Should never get here');
        } catch (error) {
          assert.ok(error instanceof errors.NotFound,
            'Error is a NotFound Feathers error'
          );
        }
      });
    });

    describe('find', () => {
      test('.find', async () => {
        const data = await service.find();

        assert.ok(Array.isArray(data), 'Data is an array');
        assert.strictEqual(data.length, 1, 'Got one entry');
      });
    });

    describe('remove', () => {
      test('.remove', async () => {
        const data = await service.remove(doug[idProp]);

        assert.strictEqual(data.name, 'Doug', 'data.name matches');
      });

      test('.remove + $select', async () => {
        const data = await service.remove(doug[idProp], {
          query: { $select: [ 'name' ] }
        });

        assert.strictEqual(data.name, 'Doug', 'data.name matches');
        assert.strictEqual(data.age, undefined, 'data.age is undefined');
      });

      test('.remove + query', async () => {
        try {
          await service.remove(doug[idProp], {
            query: { name: 'Tester' }
          });
          throw new Error('Should never get here');
        } catch (error) {
          assert.ok(error instanceof errors.NotFound,
            'Got a NotFound Feathers error'
          );
        }
      });

      it('.remove multiple', async () => {
        await service.create({ name: 'Dave', age: 29, created: true });
        await service.create({
          name: 'David',
          age: 3,
          created: true
        });

        const data = await service.remove(null, {
          query: { created: true }
        });

        assert.strictEqual(data.length, 2);

        let names = data.map(person => person.name);

        assert.ok(names.includes('Dave'), 'Dave removed');
        assert.ok(names.includes('David'), 'David removed');
      });
    });

    describe('update', () => {
      test('.update', async () => {
        const originalData = { [idProp]: doug[idProp], name: 'Dougler' };
        const originalCopy = Object.assign({}, originalData);

        const data = await service.update(doug[idProp], originalData);

        assert.deepStrictEqual(originalData, originalCopy,
          'data was not modified'
        );
        assert.strictEqual(data[idProp].toString(), doug[idProp].toString(),
          `${idProp} id matches`
        );
        assert.strictEqual(data.name, 'Dougler', 'data.name matches');
        assert.strictEqual(data.age, undefined, 'data.age is undefined');
      });

      test('.update + $select', async () => {
        const originalData = {
          [idProp]: doug[idProp],
          name: 'Dougler',
          age: 10
        };

        const data = await service.update(doug[idProp], originalData, {
          query: { $select: [ 'name' ] }
        });

        assert.strictEqual(data.name, 'Dougler', 'data.name matches');
        assert.strictEqual(data.age, undefined, 'data.age is undefined');
      });

      test('.update + NotFound', async () => {
        try {
          await service.update('568225fbfe21222432e836ff', { name: 'NotFound' });
          throw new Error('Should never get here');
        } catch (error) {
          assert.ok(error instanceof errors.NotFound, 'Error is a NotFound Feathers error');
        }
      });
    });

    describe('patch', () => {
      test('.patch', async () => {
        const originalData = { [idProp]: doug[idProp], name: 'PatchDoug' };
        const originalCopy = Object.assign({}, originalData);

        const data = await service.patch(doug[idProp], originalData);

        assert.deepStrictEqual(originalData, originalCopy,
          'original data was not modified'
        );
        assert.strictEqual(data[idProp].toString(), doug[idProp].toString(),
          `${idProp} id matches`
        );
        assert.strictEqual(data.name, 'PatchDoug', 'data.name matches');
        assert.strictEqual(data.age, 32, 'data.age matches');
      });

      test('.patch + $select', async () => {
        const originalData = { [idProp]: doug[idProp], name: 'PatchDoug' };

        const data = await service.patch(doug[idProp], originalData, {
          query: { $select: [ 'name' ] }
        });

        assert.strictEqual(data.name, 'PatchDoug', 'data.name matches');
        assert.strictEqual(data.age, undefined, 'data.age is undefined');
      });

      test('.patch multiple', async () => {
        const service = app.service(serviceName);
        const params = {
          query: { created: true }
        };

        await service.create({
          name: 'Dave',
          age: 29,
          created: true
        });

        await service.create({
          name: 'David',
          age: 3,
          created: true
        });

        const data = await service.patch(null, {
          age: 2
        }, params);

        assert.strictEqual(data.length, 2, 'returned two entries');
        assert.strictEqual(data[0].age, 2, 'First entry age was updated');
        assert.strictEqual(data[1].age, 2, 'Sceond entry age was updated');

        await service.remove(null, params);
      });

      test('.patch multi query', async () => {
        const service = app.service(serviceName);
        const params = {
          query: { age: { $lt: 10 } }
        };

        await service.create({
          name: 'Dave',
          age: 8,
          created: true
        });

        await service.create({
          name: 'David',
          age: 4,
          created: true
        });

        const data = await service.patch(null, {
          age: 2
        }, params);

        assert.strictEqual(data.length, 2, 'returned two entries');
        assert.strictEqual(data[0].age, 2, 'First entry age was updated');
        assert.strictEqual(data[1].age, 2, 'Sceond entry age was updated');

        await service.remove(null, params);
      });

      test('.patch + NotFound', async () => {
        try {
          await service.patch('568225fbfe21222432e836ff', { name: 'PatchDoug' });
          throw new Error('Should never get here');
        } catch (error) {
          assert.ok(error instanceof errors.NotFound,
            'Error is a NotFound Feathers error'
          );
        }
      });
    });

    describe('create', () => {
      test('.create', async () => {
        const originalData = {
          name: 'Bill',
          age: 40
        };
        const originalCopy = Object.assign({}, originalData);

        const data = await service.create(originalData);

        assert.deepStrictEqual(originalData, originalCopy,
          'original data was not modified'
        );
        assert.ok(data instanceof Object, 'data is an object');
        assert.strictEqual(data.name, 'Bill', 'data.name matches');

        await service.remove(data[idProp]);
      });

      test('.create + $select', async () => {
        const originalData = {
          name: 'William',
          age: 23
        };

        const data = await service.create(originalData, {
          query: { $select: [ 'name' ] }
        });

        assert.strictEqual(data.name, 'William', 'data.name matches');
        assert.strictEqual(data.age, undefined, 'data.age is undefined');

        await service.remove(data[idProp]);
      });

      test('.create multi', async () => {
        const items = [
          {
            name: 'Gerald',
            age: 18
          },
          {
            name: 'Herald',
            age: 18
          }
        ];

        const data = await service.create(items);

        assert.ok(Array.isArray(data), 'data is an array');
        assert.ok(typeof data[0][idProp] !== 'undefined', 'id is set');
        assert.strictEqual(data[0].name, 'Gerald', 'first name matches');
        assert.ok(typeof data[1][idProp] !== 'undefined', 'id is set');
        assert.strictEqual(data[1].name, 'Herald', 'second name macthes');

        await service.remove(data[0][idProp]);
        await service.remove(data[1][idProp]);
      });
    });

    describe('doesn\'t call public methods internally', () => {
      let throwing;

      before(() => {
        throwing = app.service(serviceName).extend({
          get store () {
            return app.service(serviceName).store;
          },

          find () {
            throw new Error('find method called');
          },
          get () {
            throw new Error('get method called');
          },
          create () {
            throw new Error('create method called');
          },
          update () {
            throw new Error('update method called');
          },
          patch () {
            throw new Error('patch method called');
          },
          remove () {
            throw new Error('remove method called');
          }
        });
      });

      test('internal service.find', () => app.service(serviceName).find.call(throwing));

      test('internal service.get', () =>
        app.service(serviceName).get.call(throwing, doug[idProp])
      );

      test('internal service.create', () => app.service(serviceName)
        .create.call(throwing, {
          name: 'Bob',
          age: 25
        })
      );

      test('internal service.update', () =>
        app.service(serviceName).update.call(throwing, doug[idProp], {
          name: 'Dougler'
        })
      );

      test('internal service.patch', () =>
        app.service(serviceName).patch.call(throwing, doug[idProp], {
          name: 'PatchDoug'
        })
      );

      test('internal remove', () =>
        app.service(serviceName).remove.call(throwing, doug[idProp])
      );
    });
  });
};
