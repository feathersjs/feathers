import assert from 'assert';

import { schema, Infer, queryProperty } from '../src';
import Ajv, { AnySchemaObject } from 'ajv'
import addFormats from 'ajv-formats'

const customAjv = new Ajv({
  coerceTypes: true
})
addFormats(customAjv)

// Utility for converting "date" and "date-time" string formats into Dates.
customAjv.addKeyword({
  keyword: 'convert',
  type: 'string',
  compile (schemaVal: boolean, parentSchema: AnySchemaObject) {
    return ['date-time', 'date'].includes(parentSchema.format) && schemaVal
      ? function (value: string, obj: any) {
          const { parentData, parentDataProperty } = obj;
          // Update date-time string to Date object
          parentData[parentDataProperty] = new Date(value);
          return true;
        }
      : () => true;
  }
});

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

  it('uses custom AJV with format validation', async () => {
    const formatsSchema = schema({
      $id: 'formats-test',
      type: 'object',
      required: [],
      additionalProperties: false,
      properties: {
        dobString: {
          type: 'string',
          format: 'date'
        },
        createdAt: {
          type: 'string',
          format: 'date-time'
        }
      }
    } as const, customAjv);

    await formatsSchema.validate({
      createdAt: '2021-12-22T23:59:59.999Z'
    });

    try {
      await formatsSchema.validate({
        createdAt: '2021-12-22T23:59:59.bbb'
      });
    } catch (error: any) {
      assert.equal(error.errors[0].message, 'must match format "date-time"')
    }
  });

  it('custom AJV can convert dates', async () => {
    const formatsSchema = schema({
      $id: 'converts-formats-test',
      type: 'object',
      required: [],
      additionalProperties: false,
      properties: {
        dobString: queryProperty({
          type: 'string',
          format: 'date',
          convert: true
        }),
        createdAt: {
          type: 'string',
          format: 'date-time',
          convert: true
        }
      }
    } as const, customAjv);

    const validated = await formatsSchema.validate({
      dobString: { $gt: '2025-04-25' },
      createdAt: '2021-12-22T23:59:59.999Z'
    });

    assert.ok((validated.dobString as any).$gt  instanceof Date)
    assert.ok(validated.createdAt as any instanceof Date)
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
