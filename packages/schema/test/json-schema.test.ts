import Ajv from 'ajv'
import assert from 'assert'
import { queryProperties, querySyntax } from '../src/json-schema'

describe('@feathersjs/schema/json-schema', () => {
  it('queryProperties errors for unsupported query types', () => {
    assert.throws(
      () =>
        queryProperties({
          something: {
            type: 'object'
          }
        }),
      {
        message:
          "Can not create query syntax schema for property 'something'. Only types string, number, integer, boolean, null are allowed."
      }
    )

    assert.throws(
      () =>
        queryProperties({
          otherThing: {
            type: 'array'
          }
        }),
      {
        message:
          "Can not create query syntax schema for property 'otherThing'. Only types string, number, integer, boolean, null are allowed."
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
})
