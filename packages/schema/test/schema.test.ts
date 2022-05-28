import assert from 'assert'

import { schema, Infer, queryProperty } from '../src'
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
  compile(schemaVal: boolean, parentSchema: AnySchemaObject) {
    return ['date-time', 'date'].includes(parentSchema.format) && schemaVal
      ? function (value: string, obj: any) {
          const { parentData, parentDataProperty } = obj
          // Update date-time string to Date object
          parentData[parentDataProperty] = new Date(value)
          return true
        }
      : () => true
  }
})

describe('@feathersjs/schema/schema', () => {
  it('type inference and validation', async () => {
    const messageSchema = schema({
      $id: 'message-test',
      type: 'object',
      required: ['text', 'read'],
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
    } as const)
    type Message = Infer<typeof messageSchema>

    const message = await messageSchema.validate<Message>({
      text: 'hi',
      read: 0,
      upvotes: '10'
    })

    assert.deepStrictEqual(messageSchema.toJSON(), messageSchema.definition)
    assert.deepStrictEqual(message, {
      text: 'hi',
      read: false,
      upvotes: 10
    })

    await assert.rejects(() => messageSchema.validate({ text: 'failing' }), {
      name: 'BadRequest',
      data: [
        {
          instancePath: '',
          keyword: 'required',
          message: "must have required property 'read'",
          params: {
            missingProperty: 'read'
          },
          schemaPath: '#/required'
        }
      ]
    })
  })

  it('uses custom AJV with format validation', async () => {
    const formatsSchema = schema(
      {
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
      } as const,
      customAjv
    )

    await formatsSchema.validate({
      createdAt: '2021-12-22T23:59:59.999Z'
    })

    try {
      await formatsSchema.validate({
        createdAt: '2021-12-22T23:59:59.bbb'
      })
    } catch (error: any) {
      assert.equal(error.data[0].message, 'must match format "date-time"')
    }
  })

  it('custom AJV can convert dates', async () => {
    const formatsSchema = schema(
      {
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
      } as const,
      customAjv
    )

    const validated = await formatsSchema.validate({
      dobString: { $gt: '2025-04-25' },
      createdAt: '2021-12-22T23:59:59.999Z'
    })

    assert.ok((validated.dobString as any).$gt instanceof Date)
    assert.ok((validated.createdAt as any) instanceof Date)
  })

  it('schema extension and type inference', async () => {
    const messageSchema = schema({
      $id: 'message-ext',
      type: 'object',
      required: ['text', 'read'],
      additionalProperties: false,
      properties: {
        text: {
          type: 'string'
        },
        read: {
          type: 'boolean'
        }
      }
    } as const)

    const messageResultSchema = schema({
      $id: 'message-ext-vote',
      type: 'object',
      required: ['upvotes', ...messageSchema.definition.required],
      additionalProperties: false,
      properties: {
        ...messageSchema.definition.properties,
        upvotes: {
          type: 'number'
        }
      }
    } as const)

    type MessageResult = Infer<typeof messageResultSchema>

    const m = await messageResultSchema.validate<MessageResult>({
      text: 'Hi',
      read: 'false',
      upvotes: '23'
    })

    assert.deepStrictEqual(m, {
      text: 'Hi',
      read: false,
      upvotes: 23
    })
  })

  it('with references', async () => {
    const userSchema = schema({
      $id: 'ref-user',
      type: 'object',
      required: ['email'],
      additionalProperties: false,
      properties: {
        email: { type: 'string' },
        age: { type: 'number' }
      }
    } as const)
    const messageSchema = schema({
      $id: 'ref-message',
      type: 'object',
      required: ['text', 'user'],
      additionalProperties: false,
      properties: {
        text: {
          type: 'string'
        },
        user: {
          $ref: 'ref-user'
        }
      }
    } as const)

    type User = Infer<typeof userSchema>
    type Message = Infer<typeof messageSchema> & {
      user: User
    }

    const res = await messageSchema.validate<Message>({
      text: 'Hello',
      user: {
        email: 'hello@feathersjs.com',
        age: '42'
      }
    })

    assert.ok(userSchema)
    assert.deepStrictEqual(res, {
      text: 'Hello',
      user: { email: 'hello@feathersjs.com', age: 42 }
    })
  })

  it('works with oneOf properties (#2508)', async () => {
    const oneOfSchema = schema({
      $id: 'schemaA',
      oneOf: [
        {
          type: 'object',
          additionalProperties: false,
          required: ['x'],
          properties: {
            x: { type: 'number' }
          }
        },
        {
          type: 'object',
          additionalProperties: false,
          required: ['y'],
          properties: {
            y: { type: 'number' }
          }
        }
      ]
    } as const)

    const res = await oneOfSchema.validate({
      x: '3'
    })

    assert.deepStrictEqual(res, { x: 3 })
  })

  it('can handle compound queryProperty', async () => {
    const formatsSchema = schema(
      {
        $id: 'compoundQueryProperty',
        type: 'object',
        required: [],
        additionalProperties: false,
        properties: {
          dobString: queryProperty({
            oneOf: [
              { type: 'string', format: 'date', convert: true },
              { type: 'string', format: 'date-time', convert: true },
              { type: 'object' }
            ]
          })
        }
      } as const,
      customAjv
    )

    const validated = await formatsSchema.validate({
      dobString: { $gt: '2025-04-25', $lte: new Date('2027-04-25') }
    })

    assert.ok(validated)
  })

  it('can still fail queryProperty validation', async () => {
    const formatsSchema = schema(
      {
        $id: 'compoundQueryPropertyFail',
        type: 'object',
        required: [],
        additionalProperties: false,
        properties: {
          dobString: queryProperty({ type: 'string' })
        }
      } as const,
      customAjv
    )

    try {
      const validated = await formatsSchema.validate({
        dobString: { $moose: 'test' }
      })
      assert(!validated, 'should not have gotten here')
    } catch (error: any) {
      assert.ok(error.data?.length > 0)
    }
  })

  it('removes default from queryProperty schemas like $gt', async () => {
    const validator = schema(
      {
        $id: 'noDefault$gt',
        type: 'object',
        required: [],
        additionalProperties: false,
        properties: {
          someDate: queryProperty({ default: '0000-00-00', type: 'string' })
        }
      } as const,
      customAjv
    )

    assert.equal(
      validator.definition.properties.someDate.anyOf[1].properties.$gt.type,
      'string',
      'type is found under $gt'
    )
    assert(!validator.definition.properties.someDate.anyOf[1].properties.$gt.default, 'no default under $gt')
  })
})
