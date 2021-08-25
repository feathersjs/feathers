import assert from 'assert';

import { schema, Infer } from '../src';

describe('@feathersjs/schema/schema', () => {
  it('type inference and validation', async () => {
    const messageSchema = schema({
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

    assert.deepStrictEqual(message, {
      text: 'hi',
      read: false,
      upvotes: 10
    });
  });
});
