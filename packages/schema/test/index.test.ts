import assert from 'assert';
import { feathers, HookContext } from '@feathersjs/feathers';
import { memory } from '@feathersjs/memory';

import { schema, resolveSchemas, Infer } from '../src';

describe('@feathersjs/schema', () => {
  it('simple JSON schema and resolving', async () => {
    const messageSchema = schema({
      type: 'object',
      required: [ 'text' ],
      additionalProperties: false,
      properties: {
        text: {
          type: 'string'
        },
        read: {
          type: 'boolean'
        },
        upvotes: {
          type: 'number'
        },
        user: {
          type: 'object',
          resolve () {
            return { name: 'Dave' };
          }
        }
      }
    } as const);
    type Message = Infer<typeof messageSchema>;

    const message: Message = await messageSchema.resolve({
      text: 'hi',
      read: 0,
      upvotes: '10'
    });

    assert.deepStrictEqual(message, {
      text: 'hi',
      read: false,
      upvotes: 10,
      user: { name: 'Dave' }
    });
  });

  it ('schemas in Feathers app', async () => {
    const messageSchema = schema({
      type: 'object',
      required: [ 'text', 'userId' ],
      additionalProperties: false,
      properties: {
        id: { type: 'number' },
        text: { type: 'string' },
        userId: { type: 'number' },
        user: {
          type: 'object',
          resolve (_value: any, message: any, context: HookContext) {
            if (context.result === undefined) {
              return undefined;
            }

            return context.app.service('users').get(message.userId);
          }
        }
      }
    } as const);
    const userSchema = schema({
      type: 'object',
      required: [ 'email' ],
      additionalProperties: false,
      properties: {
        id: { type: 'number' },
        email: { type: 'string' }
      }
    } as const);

    const app = feathers()
      .use('/messages', memory(), {
        schema: {
          result: messageSchema,
          data: messageSchema
        }
      })
      .use('/users', memory(), {
        schema: {
          result: userSchema,
          data: userSchema
        }
      });

    app.hooks([
      resolveSchemas()
    ]);

    const user = await app.service('users').create({
      email: 'test@user.com'
    });

    const message = await app.service('messages').create({
      text: 'Hi there',
      userId: user.id
    });

    assert.deepStrictEqual(message, {
      text: 'Hi there',
      userId: 0,
      id: 0,
      user: { email: 'test@user.com', id: 0 }
    });
  });
});
