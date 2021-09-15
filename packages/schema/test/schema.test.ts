import assert from 'assert';

import { schema, Infer } from '../src';

describe('@feathersjs/schema/schema', () => {
  it('type inference and validation', async () => {
    const messageSchema = schema({
      $id: 'message-test',
      type: 'object',
      required: [ 'text', 'read' ],
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
        }
      }
    } as const);
    type Message = Infer<typeof messageSchema>;

    const message: Message = await messageSchema.validate({
      text: 'hi',
      read: 0,
      upvotes: '10'
    });

    assert.deepStrictEqual(messageSchema.toJSON(), messageSchema.definition);
    assert.deepStrictEqual(message, {
      text: 'hi',
      read: false,
      upvotes: 10
    });
  });

  it('schema extension and type inference', async () => {
    const messageSchema = schema({
      $id: 'message-ext',
      type: 'object',
      required: [ 'text', 'read' ],
      additionalProperties: false,
      properties: {
        text: {
          type: 'string'
        },
        read: {
          type: 'boolean'
        }
      }
    } as const);
    const messageResultSchema = messageSchema.extend({
      $id: 'message-ext-vote',
      required: [ 'upvotes' ],
      properties: {
        upvotes: {
          type: 'number'
        }
      }
    } as const);

    type MessageResult = Infer<typeof messageResultSchema>;

    const m: MessageResult = await messageResultSchema.validate({
      text: 'Hi',
      read: 'false',
      upvotes: '23'
    });

    assert.deepStrictEqual(m, {
      text: 'Hi',
      read: false,
      upvotes: 23
    });
  });

  it('with references and type extension', async () => {
    const userSchema = schema({
      $id: 'ref-user',
      type: 'object',
      required: [ 'email' ],
      properties: {
        email: { type: 'string' },
        age: { type: 'number' }
      }
    } as const);
    const messageSchema = schema({
      $id: 'ref-message',
      type: 'object',
      required: [ 'text', 'user' ],
      additionalProperties: false,
      properties: {
        text: {
          type: 'string'
        },
        user: {
          $ref: 'ref-user'
        }
      }
    } as const);

    type User = Infer<typeof userSchema>;
    type Message = Infer<typeof messageSchema> & {
      user: User
    };

    // TODO find a way to not have to force cast this
    const res = await messageSchema.validate({
      text: 'Hello',
      user: {
        email: 'hello@feathersjs.com',
        age: '42'
      }
    }) as Message;

    assert.ok(userSchema);
    assert.deepStrictEqual(res, {
      text: 'Hello',
      user: { email: 'hello@feathersjs.com', age: 42 }
    });
  });
});
