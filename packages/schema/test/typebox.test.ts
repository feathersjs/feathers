import assert from 'assert'
import { typebox, Type, Ajv, Static } from '../src'

describe('@feathersjs/schema/typebox', () => {
  it('querySyntax', async () => {
    const schema = Type.Object({
      name: Type.String(),
      age: Type.Number()
    })

    const querySchema = typebox.querySyntax(schema)

    type Query = Static<typeof querySchema>

    const query: Query = {
      name: 'Dave',
      age: { $gt: 42, $in: [50, 51] },
      $select: ['age', 'name'],
      $sort: {
        age: 1
      }
    }

    const validator = new Ajv().compile(querySchema)
    const validated = (await validator(query)) as any as Query

    assert.ok(validated)
  })
})
