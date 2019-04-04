import assert from 'assert';
import { HookContext } from '@feathersjs/feathers';
import { hooks } from '../../src';

const { protect } = hooks;

function testOmit(title: string, property: string) {
  describe(title, () => {
    const fn = protect('password');

    it('omits from object', () => {
      const data = {
        email: 'test@user.com',
        password: 'supersecret'
      };
      const context = {
        [property]: data
      } as unknown as HookContext;
      const result = fn(context);

      assert.deepStrictEqual(result, {
        [property]: data,
        dispatch: { email: 'test@user.com' }
      });
    });

    it('omits from nested object', () => {
      const hook = protect('user.password');
      const data = {
        user: {
          email: 'test@user.com',
          password: 'supersecret'
        }
      };
      const context = {
        [property]: data
      } as unknown as HookContext;
      const result = hook(context);

      assert.deepStrictEqual(result, {
        [property]: data,
        dispatch: { user: { email: 'test@user.com' } }
      });
    });

    it('handles `data` property only for find', () => {
      const data = {
        email: 'test@user.com',
        password: 'supersecret',
        data: 'yes'
      };
      const context = {
        [property]: data
      } as unknown as HookContext;
      const result = fn(context);

      assert.deepStrictEqual(result, {
        [property]: data,
        dispatch: { email: 'test@user.com', data: 'yes' }
      });
    });

    it('uses .toJSON (#48)', () => {
      class MyUser {
        toJSON() {
          return {
            email: 'test@user.com',
            password: 'supersecret'
          };
        }
      }

      const data = new MyUser();
      const context = {
        [property]: data
      } as unknown as HookContext;
      const result = fn(context);

      assert.deepStrictEqual(result, {
        [property]: data,
        dispatch: { email: 'test@user.com' }
      });
    });

    it('omits from array', () => {
      const data = [{
        email: 'test1@user.com',
        password: 'supersecret'
      }, {
        email: 'test2@user.com',
        password: 'othersecret'
      }];
      const context = {
        [property]: data
      } as unknown as HookContext;
      const result = fn(context);

      assert.deepStrictEqual(result, {
        [property]: data,
        dispatch: [
          { email: 'test1@user.com' },
          { email: 'test2@user.com' }
        ]
      });
    });

    it('omits from pagination object', () => {
      const data = {
        total: 2,
        data: [{
          email: 'test1@user.com',
          password: 'supersecret'
        }, {
          email: 'test2@user.com',
          password: 'othersecret'
        }]
      };
      const context = {
        method: 'find',
        [property]: data
      } as unknown as HookContext;
      const result = fn(context);

      assert.deepStrictEqual(result, {
        method: 'find',
        [property]: data,
        dispatch: {
          total: 2,
          data: [
            { email: 'test1@user.com' },
            { email: 'test2@user.com' }
          ]
        }
      });
    });

    it('updates result if params.provider is set', () => {
      const data = [{
        email: 'test1@user.com',
        password: 'supersecret'
      }, {
        email: 'test2@user.com',
        password: 'othersecret'
      }];
      const params = { provider: 'test' };
      const context = {
        [property]: data,
        params
      } as unknown as HookContext;
      const result = fn(context);

      assert.deepStrictEqual(result, {
        [property]: data,
        params,
        result: [
          { email: 'test1@user.com' },
          { email: 'test2@user.com' }
        ],
        dispatch: [
          { email: 'test1@user.com' },
          { email: 'test2@user.com' }
        ]
      });
    });
  });
}

describe('@feathersjs/authentication-local/hooks/protect', () => {
  it('does nothing when called with no result', () => {
    const fn = protect();
    const original = {} as unknown as HookContext;

    assert.deepStrictEqual(fn(original), original);
  });

  testOmit('with hook.result', 'result');
  testOmit('with hook.dispatch already set', 'dispatch');
});
