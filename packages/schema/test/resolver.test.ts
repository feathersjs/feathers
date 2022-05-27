import assert from 'assert'
import { BadRequest } from '@feathersjs/errors'

import { schema, resolve, Infer } from '../src'

describe('@feathersjs/schema/resolver', () => {
  const userSchema = schema({
    $id: 'simple-user',
    type: 'object',
    required: ['firstName', 'lastName'],
    additionalProperties: false,
    properties: {
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      password: { type: 'string' }
    }
  } as const)
  const context = {
    isContext: true
  }

  type User = Infer<typeof userSchema> & {
    name: string
  }

  it('simple resolver', async () => {
    const userResolver = resolve<User, typeof context>({
      properties: {
        password: async (): Promise<string> => {
          return undefined
        },

        name: async (_name, user, ctx, status) => {
          assert.deepStrictEqual(ctx, context)
          assert.deepStrictEqual(status.path, ['name'])
          assert.strictEqual(typeof status.stack[0], 'function')

          return `${user.firstName} ${user.lastName}`
        }
      }
    })

    const u = await userResolver.resolve(
      {
        firstName: 'Dave',
        lastName: 'L.'
      },
      context
    )

    assert.deepStrictEqual(u, {
      firstName: 'Dave',
      lastName: 'L.',
      name: 'Dave L.'
    })

    const withProps: any = await userResolver.resolve(
      {
        firstName: 'David',
        lastName: 'L'
      },
      context,
      {
        properties: ['name', 'lastName']
      }
    )

    assert.deepStrictEqual(withProps, {
      name: 'David L',
      lastName: 'L'
    })
  })

  it('simple resolver with schema and validation', async () => {
    const userBeforeResolver = resolve<User, typeof context>({
      schema: userSchema,
      validate: 'before',
      properties: {
        name: async (_name, user) => `${user.firstName} ${user.lastName}`
      }
    })
    const userAfterResolver = resolve<User, typeof context>({
      schema: userSchema,
      validate: 'after',
      properties: {
        firstName: async () => undefined
      }
    })

    await assert.rejects(() => userBeforeResolver.resolve({}, context), {
      message: 'validation failed'
    })
    await assert.rejects(
      () =>
        userAfterResolver.resolve(
          {
            firstName: 'Test',
            lastName: 'Me'
          },
          context
        ),
      {
        message: 'validation failed'
      }
    )
  })

  it('simple resolver with converter', async () => {
    const userConverterResolver = resolve<User, typeof context>({
      schema: userSchema,
      validate: 'before',
      converter: async (data) => ({
        firstName: 'Default',
        lastName: 'Name',
        ...data
      }),
      properties: {
        name: async (_name, user) => `${user.firstName} ${user.lastName}`
      }
    })

    const u = await userConverterResolver.resolve({}, context)

    assert.deepStrictEqual(u, {
      firstName: 'Default',
      lastName: 'Name',
      name: 'Default Name'
    })
  })

  it('resolving with errors', async () => {
    const dummyResolver = resolve({
      properties: {
        name: async (value) => {
          if (value === 'Dave') {
            throw new Error(`No ${value}s allowed`)
          }

          return value
        },
        age: async (value) => {
          if (value < 18) {
            throw new BadRequest('Invalid age')
          }

          return value
        }
      }
    })

    assert.rejects(
      () =>
        dummyResolver.resolve(
          {
            name: 'Dave',
            age: 16
          },
          {}
        ),
      {
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
      }
    )
  })
})
