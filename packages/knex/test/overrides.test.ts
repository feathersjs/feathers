// const chai = require('chai')
// const chaiAsPromised = require('chai-as-promised')
// const feathers = require('@feathersjs/feathers')
// const knex = require('knex')

// const service = require('../lib')

// chai.use(chaiAsPromised)
// const { expect } = chai

// const { transaction } = service.hooks

// const db = knex({
//   client: 'sqlite3',
//   connection: {
//     filename: './db.sqlite'
//   }
// })

// const schemaName = 'service_method_overrides'
// knex({
//   client: 'sqlite3',
//   connection: {
//     filename: `./${schemaName}.sqlite`
//   }
// })

// /**
//  * Override the _find() method to manipulate the knex query, and
//  * introduce ambiguity by the table to itself.
//  */
// class Animal extends service.Service {
//   _find(params) {
//     const knexQuery = this.createQuery(params)
//     knexQuery
//       .select('ancestors.name as ancestor_name')
//       .leftJoin('animals as ancestors', 'ancestors.id', '=', 'animals.ancestor_id')
//     params.knex = knexQuery
//     return super._find(params)
//   }
// }

// const animals = new Animal({
//   Model: db,
//   name: 'animals',
//   events: ['testing']
// })

// function clean() {
//   return db.schema.dropTableIfExists(animals.fullName).then(() => {
//     return db.schema.createTable(animals.fullName, (table) => {
//       table.increments('id')
//       table.integer('ancestor_id')
//       table.string('name').notNullable()
//       return table
//     })
//   })
// }

// // Attach the database to mimic a "schema"
// function attachSchema() {
//   return db.schema.raw(`attach database '${schemaName}.sqlite' as ${schemaName}`)
// }

// describe('Feathers Knex Overridden Method With Self-Join', () => {
//   let ancestor
//   let animal

//   const app = feathers()
//     .hooks({
//       before: transaction.start(),
//       after: transaction.end(),
//       error: transaction.rollback()
//     })
//     .use('/animals', animals)
//   const animalService = app.service('animals')

//   before(attachSchema)
//   before(clean)
//   after(clean)

//   beforeEach(async () => {
//     ancestor = await animalService.create({
//       name: 'Ape'
//     })
//     animal = await animalService.create({
//       ancestor_id: ancestor.id,
//       name: 'Human'
//     })
//   })

//   it('finds properly', async () => {
//     const foundAnimals = await animalService.find({
//       query: {
//         $limit: 1,
//         ancestor_name: 'Ape'
//       }
//     })
//     expect(foundAnimals[0].id).to.equal(animal.id)
//     expect(foundAnimals[0].name).to.equal('Human')
//     expect(foundAnimals[0].ancestor_name).to.equal('Ape')
//   })

//   /**
//    * Previously, any query modified to include joins with ambiguous primary keys
//    * would yield an ambiguous column errors:
//    *   BadRequest: select `animals`.*
//    *   from `animals`
//    *      left join `animals` as `ancestors` on `ancestors`.`id` = `animals`.`ancestor_id`
//    *   where `id` in (2) - SQLITE_ERROR: ambiguous column name: id
//    *
//    * The fix involves explicitly specifying the table to query in the _patch() method
//    */
//   it('patches without ambiguous query', async () => {
//     const newName = 'Homo Sapiens'
//     const patchedAnimal = await animalService.patch(animal.id, { name: newName })
//     expect(patchedAnimal.name).to.equal(newName)
//   })
// })
