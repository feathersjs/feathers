import Ajv from 'ajv'
import assert from 'assert'
import { FromSchema } from '../src'
import { queryProperties, querySyntax } from '../src/json-schema'

describe('@feathersjs/schema/json-schema', () => {
  it('queryProperties errors for unsupported query types', () => {
    assert.throws(
      () =>
        queryProperties({
          something: {
            $ref: 'something'
          }
        }),
      {
        message: "Can not create query syntax schema for reference property 'something'"
      }
    )
  })

  it('querySyntax works with no properties', async () => {
    const schema = {
      type: 'object',
      properties: querySyntax({})
    }

    new Ajv().compile(schema)
  })

  it('querySyntax with extensions', async () => {
    const schema = {
      name: {
        type: 'string'
      },
      age: {
        type: 'number'
      }
    } as const

    const querySchema = {
      type: 'object',
      properties: querySyntax(schema, {
        name: {
          $ilike: {
            type: 'string'
          }
        },
        age: {
          $value: {
            type: 'null'
          }
        }
      } as const)
    } as const

    type Query = FromSchema<typeof querySchema>

    const q: Query = {
      name: {
        $ilike: 'hello'
      },
      age: {
        $value: null,
        $gte: 42
      }
    }

    const validator = new Ajv({ strict: false }).compile(schema)

    assert.ok(validator(q))
  })
})
