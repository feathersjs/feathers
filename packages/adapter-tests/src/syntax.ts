import assert from 'assert';

export default (test: any, app: any, _errors: any, serviceName: string, idProp: string) => {
  describe('Query Syntax', () => {
    let bob: any;
    let alice: any;
    let doug: any;
    let service: any;

    beforeEach(async () => {
      service = app.service(serviceName);
      bob = await app.service(serviceName).create({
        name: 'Bob',
        age: 25
      });
      doug = await app.service(serviceName).create({
        name: 'Doug',
        age: 32
      });
      alice = await app.service(serviceName).create({
        name: 'Alice',
        age: 19
      });
    });

    afterEach(async () => {
      await service.remove(bob[idProp]);
      await service.remove(alice[idProp]);
      await service.remove(doug[idProp]);
    });

    test('.find + equal', async () => {
      const params = { query: { name: 'Alice' } };
      const data = await service.find(params);

      assert.ok(Array.isArray(data));
      assert.strictEqual(data.length, 1);
      assert.strictEqual(data[0].name, 'Alice');
    });

    test('.find + equal multiple', async () => {
      const data = await service.find({
        query: { name: 'Alice', age: 20 }
      });

      assert.strictEqual(data.length, 0);
    });

    describe('special filters', () => {
      test('.find + $sort', async () => {
        let data = await service.find({
          query: {
            $sort: { name: 1 }
          }
        });

        assert.strictEqual(data.length, 3);
        assert.strictEqual(data[0].name, 'Alice');
        assert.strictEqual(data[1].name, 'Bob');
        assert.strictEqual(data[2].name, 'Doug');

        data = await service.find({
          query: {
            $sort: { name: -1 }
          }
        });

        assert.strictEqual(data.length, 3);
        assert.strictEqual(data[0].name, 'Doug');
        assert.strictEqual(data[1].name, 'Bob');
        assert.strictEqual(data[2].name, 'Alice');
      });

      test('.find + $sort + string', async () => {
        const data = await service.find({
          query: {
            $sort: { name: '1' }
          }
        });

        assert.strictEqual(data.length, 3);
        assert.strictEqual(data[0].name, 'Alice');
        assert.strictEqual(data[1].name, 'Bob');
        assert.strictEqual(data[2].name, 'Doug');
      });

      test('.find + $limit', async () => {
        const data = await service.find({
          query: {
            $limit: 2
          }
        });

        assert.strictEqual(data.length, 2);
      });

      test('.find + $limit 0', async () => {
        const data = await service.find({
          query: {
            $limit: 0
          }
        });

        assert.strictEqual(data.length, 0);
      });

      test('.find + $skip', async () => {
        const data = await service.find({
          query: {
            $sort: { name: 1 },
            $skip: 1
          }
        });

        assert.strictEqual(data.length, 2);
        assert.strictEqual(data[0].name, 'Bob');
        assert.strictEqual(data[1].name, 'Doug');
      });

      test('.find + $select', async () => {
        const data = await service.find({
          query: {
            name: 'Alice',
            $select: ['name']
          }
        });

        assert.strictEqual(data.length, 1);
        assert.strictEqual(data[0].name, 'Alice');
        assert.strictEqual(data[0].age, undefined);
      });

      test('.find + $or', async () => {
        const data = await service.find({
          query: {
            $or: [
              { name: 'Alice' },
              { name: 'Bob' }
            ],
            $sort: { name: 1 }
          }
        });

        assert.strictEqual(data.length, 2);
        assert.strictEqual(data[0].name, 'Alice');
        assert.strictEqual(data[1].name, 'Bob');
      });

      test('.find + $in', async () => {
        const data = await service.find({
          query: {
            name: {
              $in: ['Alice', 'Bob']
            },
            $sort: { name: 1 }
          }
        });

        assert.strictEqual(data.length, 2);
        assert.strictEqual(data[0].name, 'Alice');
        assert.strictEqual(data[1].name, 'Bob');
      });

      test('.find + $nin', async () => {
        const data = await service.find({
          query: {
            name: {
              $nin: [ 'Alice', 'Bob' ]
            }
          }
        });

        assert.strictEqual(data.length, 1);
        assert.strictEqual(data[0].name, 'Doug');
      });

      test('.find + $lt', async () => {
        const data = await service.find({
          query: {
            age: {
              $lt: 30
            }
          }
        });

        assert.strictEqual(data.length, 2);
      });

      test('.find + $lte', async () => {
        const data = await service.find({
          query: {
            age: {
              $lte: 25
            }
          }
        });

        assert.strictEqual(data.length, 2);
      });

      test('.find + $gt', async () => {
        const data = await service.find({
          query: {
            age: {
              $gt: 30
            }
          }
        });

        assert.strictEqual(data.length, 1);
      });

      test('.find + $gte', async () => {
        const data = await service.find({
          query: {
            age: {
              $gte: 25
            }
          }
        });

        assert.strictEqual(data.length, 2);
      });

      test('.find + $ne', async () => {
        const data = await service.find({
          query: {
            age: {
              $ne: 25
            }
          }
        });

        assert.strictEqual(data.length, 2);
      });
    });

    test('.find + $gt + $lt + $sort', async () => {
      const params = {
        query: {
          age: {
            $gt: 18,
            $lt: 30
          },
          $sort: { name: 1 }
        }
      };

      const data = await service.find(params);

      assert.strictEqual(data.length, 2);
      assert.strictEqual(data[0].name, 'Alice');
      assert.strictEqual(data[1].name, 'Bob');
    });

    test('.find + $or nested + $sort', async () => {
      const params = {
        query: {
          $or: [
            { name: 'Doug' },
            {
              age: {
                $gte: 18,
                $lt: 25
              }
            }
          ],
          $sort: { name: 1 }
        }
      };

      const data = await service.find(params);

      assert.strictEqual(data.length, 2);
      assert.strictEqual(data[0].name, 'Alice');
      assert.strictEqual(data[1].name, 'Doug');
    });

    describe('paginate', function () {
      beforeEach(() => {
        service.options.paginate = {
          default: 1,
          max: 2
        };
      });

      afterEach(() => {
        service.options.paginate = {};
      });

      test('.find + paginate', async () => {
        const page = await service.find({
          query: { $sort: { name: -1 } }
        });

        assert.strictEqual(page.total, 3);
        assert.strictEqual(page.limit, 1);
        assert.strictEqual(page.skip, 0);
        assert.strictEqual(page.data[0].name, 'Doug');
      });

      test('.find + paginate + query', async () => {
        const page = await service.find({
          query: {
            $sort: { name: -1 },
            name: 'Doug'
          }
        });

        assert.strictEqual(page.total, 1);
        assert.strictEqual(page.limit, 1);
        assert.strictEqual(page.skip, 0);
        assert.strictEqual(page.data[0].name, 'Doug');
      });

      test('.find + paginate + $limit + $skip', async () => {
        const params = {
          query: {
            $skip: 1,
            $limit: 4,
            $sort: { name: -1 }
          }
        };

        const page = await service.find(params);

        assert.strictEqual(page.total, 3);
        assert.strictEqual(page.limit, 2);
        assert.strictEqual(page.skip, 1);
        assert.strictEqual(page.data[0].name, 'Bob');
        assert.strictEqual(page.data[1].name, 'Alice');
      });

      test('.find + paginate + $limit 0', async () => {
        const page = await service.find({
          query: { $limit: 0 }
        });

        assert.strictEqual(page.total, 3);
        assert.strictEqual(page.data.length, 0);
      });

      test('.find + paginate + params', async () => {
        const page = await service.find({ paginate: { default: 3 } });

        assert.strictEqual(page.limit, 3);
        assert.strictEqual(page.skip, 0);

        const results = await service.find({ paginate: false });

        assert.ok(Array.isArray(results));
        assert.strictEqual(results.length, 3);
      });
    });
  });
};
