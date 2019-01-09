const assert = require('assert');
const hooks = require('../lib');

describe('async-hooks', () => {
  describe('hookFunction', () => {
    const hello = async name => {
      return `Hello ${name}`;
    };

    it('can override arguments, has context', async () => {
      const addYou = async (ctx, next) => {
        assert.deepStrictEqual(ctx, {
          arguments: [ 'There' ]
        });
        ctx.arguments[0] += ' You';

        await next();
      };

      const fn = hooks(hello, [ addYou ]);
      const res = await fn('There');

      assert.strictEqual(res, 'Hello There You');
    });

    it('can override context.result before, skips method call', async () => {
      const hello = async name => {
        throw new Error('Should never get here');
      };
      const updateResult = async (ctx, next) => {
        ctx.result = 'Hello Dave';

        await next();
      };

      const fn = hooks(hello, [ updateResult ]);
      const res = await fn('There');

      assert.strictEqual(res, 'Hello Dave');
    });

    it('can override context.result after', async () => {
      const updateResult = async (ctx, next) => {
        await next();

        ctx.result += ' You!';
      };

      const fn = hooks(hello, [ updateResult ]);
      const res = await fn('There');

      assert.strictEqual(res, 'Hello There You!');
    });

    it('uses a custom getContext', async () => {
      const checkContext = async (ctx, next) => {
        assert.deepStrictEqual(ctx, {
          arguments: [ 'There' ],
          test: 'me'
        });
        await next();
      };

      const fn = hooks(hello, [ checkContext ], args => ({
        arguments: args,
        test: 'me'
      }));
      const res = await fn('There');

      assert.strictEqual(res, 'Hello There');
    });

    it('maintains the function context', async () => {
      const hook = async function (ctx, next) {
        // assert.strictEqual(obj, this);
        await next();
      };
      const obj = {
        message: 'Hi',

        sayHi: hooks(async function (name) {
          return `${this.message} ${name}`;
        }, [ hook ])
      };
      const res = await obj.sayHi('Dave');

      assert.strictEqual(res, 'Hi Dave');
    });
  });

  describe('hookObject', () => {
    const symbol = Symbol('test');
    const obj = {
      test: 'me',

      [symbol]: true,

      async sayHi (name) {
        return `Hi ${name}`;
      },

      async addOne (number) {
        return number + 1;
      }
    };

    it('returns a new object with hook methods, sets method name', async () => {
      const hookedObj = hooks(obj, {
        sayHi: [async (ctx, next) => {
          assert.deepStrictEqual(ctx, {
            method: 'sayHi',
            arguments: [ 'David' ]
          });

          await next();

          ctx.result += '?';
        }],
        addOne: [async (ctx, next) => {
          ctx.arguments[0] += 1;

          await next();
        }]
      });

      assert.ok(hookedObj[symbol]);
      assert.notStrictEqual(obj, hookedObj);
      assert.strictEqual(await hookedObj.sayHi('David'), 'Hi David?');
      assert.strictEqual(await hookedObj.addOne(1), 3);
    });

    it('throws an error when hooking invalid method', async () => {
      try {
        hooks(obj, {
          test: [async (ctx, next) => {
            await next();
          }]
        });
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(error.message, `Can not apply hooks. 'test' is not a function`);
      }
    });
  });

  describe('hookDecorator', () => {
    const obj = {
      test: 'me',

      async sayHi (name) {
        return `Hi ${name}`;
      }
    };

    it('runs as a decorator', async () => {
      const decorator = hooks([async (ctx, next) => {
        assert.deepStrictEqual(ctx, {
          method: 'sayHi',
          arguments: [ 'David' ]
        });

        await next();

        ctx.result += ' Decorated';
      }]);

      assert.strictEqual(decorator.length, 3);

      const descriptor = Object.getOwnPropertyDescriptor(obj, 'sayHi');
      const modifiedDescriptor = decorator(obj, 'sayHi', descriptor);

      Object.defineProperty(obj, 'sayHi', modifiedDescriptor);

      assert.strictEqual(await obj.sayHi('David'), 'Hi David Decorated');
    });

    it('throws an error when decorating a non-function', async () => {
      const decorator = hooks([async (ctx, next) => {
        await next();
      }]);

      assert.strictEqual(decorator.length, 3);

      try {
        const descriptor = Object.getOwnPropertyDescriptor(obj, 'test');
        decorator(obj, 'test', descriptor);
        assert.fail('Should never get here');
      } catch (error) {
        assert.equal(error.message, `Can not apply hooks. 'test' is not a function`);
      }
    });
  });
});
