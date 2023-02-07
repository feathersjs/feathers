import knex from 'knex'
import assert from 'assert'
import { feathers, Paginated } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService, transaction } from '../src'
import { PaginationOptions } from '@feathersjs/adapter-commons'

// const { transaction } = service.hooks

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './db.sqlite'
  }
})

const schemaName = 'overrides'

knex({
  client: 'sqlite3',
  connection: {
    filename: `./${schemaName}.sqlite`
  }
})

type Animal = {
  id: number
  ancestor_id: number
  ancestor_name: string
  name: string
}

/**
 * Override the _find() method to manipulate the knex query, and
 * introduce ambiguity by the table to itself.
 */
class AnimalService<T = Animal, P extends KnexAdapterParams = KnexAdapterParams> extends KnexService<T> {
  async _find(params?: P & { paginate?: PaginationOptions }): Promise<Paginated<T>>
  async _find(params?: P & { paginate: false }): Promise<T[]>
  async _find(params?: P): Promise<Paginated<T> | T[]>
  async _find(params: P = {} as P): Promise<Paginated<T> | T[]> {
    const knexQuery = this.createQuery(params)
    knexQuery
      .select('ancestors.name as ancestor_name')
      .leftJoin('animals as ancestors', 'ancestors.id', '=', 'animals.ancestor_id')
    params.knex = knexQuery
    return super._find(params)
  }
}

const animals = new AnimalService({
  Model: db,
  name: 'animals',
  events: ['testing']
})

function clean() {
  return db.schema.dropTableIfExists(animals.fullName).then(() => {
    return db.schema.createTable(animals.fullName, (table) => {
      table.increments('id')
      table.integer('ancestor_id')
      table.string('name').notNullable()
      return table
    })
  })
}

describe('Feathers Knex Overridden Method With Self-Join', () => {
  let ancestor: Animal
  let animal: Animal

  const app = feathers<{ animals: AnimalService }>()
    .hooks({
      before: [transaction.start()],
      after: [transaction.end()],
      error: [transaction.rollback()]
    })
    .use('animals', animals)
  const animalService = app.service('animals')

  before(() => {
    return db.schema.raw(`attach database '${schemaName}.sqlite' as ${schemaName}`)
  })
  before(clean)
  after(clean)

  beforeEach(async () => {
    ancestor = await animalService.create({
      name: 'Ape'
    })
    animal = await animalService.create({
      ancestor_id: ancestor.id,
      name: 'Human'
    })
  })

  it('finds properly', async () => {
    const foundAnimals = await animalService.find({
      paginate: false,
      query: {
        $limit: 1,
        ancestor_name: 'Ape'
      }
    })
    assert.strictEqual(foundAnimals[0].id, animal.id)
    assert.strictEqual(foundAnimals[0].name, 'Human')
    assert.strictEqual(foundAnimals[0].ancestor_name, 'Ape')
  })

  /**
   * Previously, any query modified to include joins with ambiguous primary keys
   * would yield an ambiguous column errors:
   *   BadRequest: select `animals`.*
   *   from `animals`
   *      left join `animals` as `ancestors` on `ancestors`.`id` = `animals`.`ancestor_id`
   *   where `id` in (2) - SQLITE_ERROR: ambiguous column name: id
   *
   * The fix involves explicitly specifying the table to query in the _patch() method
   */
  it('patches without ambiguous query', async () => {
    const newName = 'Homo Sapiens'
    const patchedAnimal = await animalService.patch(animal.id, { name: newName })

    assert.strictEqual(patchedAnimal.name, newName)
  })

  it('get the service model (getModel)', async () => {
    const model = animalService.Model
    const options = animalService.options

    assert.strictEqual(model, options.Model)
  })
})
