import assert from 'assert';
import { BadRequest } from '@feathersjs/errors';

import { schema, resolve, Infer } from '../src';

describe('@feathersjs/schema/resolver', () => {
  it('simple resolver and combined type inference', async () => {
    const userSchema = schema({
      type: 'object',
      required: ['firstName', 'lastName'],
      additionalProperties: false,
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        password: { type: 'string' }
      }
    } as const);
    const userResolver = resolve({
      properties: {
        password: async () => {
          return undefined;
        },

        name: async (_name: unknown, user: any) => {
          return `${user.firstName} ${user.lastName}`;
        }
      }
    });

    type User = Infer<typeof userSchema, typeof userResolver>;

    const u: User = await userResolver.resolve({
      firstName: 'Dave',
      lastName: 'L.'
    });

    assert.deepStrictEqual(u, {
      firstName: 'Dave',
      lastName: 'L.',
      name: 'Dave L.'
    });
  });

  it('resolving with errors', async () => {
    const dummyResolver = resolve({
      properties: {
        name: async value => {
          if (value === 'Dave') {
            throw new Error(`No ${value}s allowed`);
          }

          return value;
        },
        age: async value => {
          if (value < 18) {
            throw new BadRequest('Invalid age');
          }

          return value;
        }
      }
    });

    assert.rejects(() => dummyResolver.resolve({
      name: 'Dave',
      age: 16
    }), {
      name: 'BadRequest',
      message: 'Error resolving data',
      code: 400,
      className: 'bad-request',
      data: {
        name: { message: 'No Daves allowed' },
        age: {
          name: 'BadRequest',
          message: 'Invalid age',
          code: 400,
          className: 'bad-request'
        }
      }
    });
  });
});