import { Db, MongoClient, ObjectId } from 'mongodb'
import adapterTests from '@feathersjs/adapter-tests'
import assert from 'assert'

import { feathers } from '@feathersjs/feathers'
import errors from '@feathersjs/errors'
import { MongoDBService } from '../src'

const testSuite = adapterTests([
  '.options',
  '.events',
  '._get',
  '._find',
  '._create',
  '._update',
  '._patch',
  '._remove',
  '.$get',
  '.$find',
  '.$create',
  '.$update',
  '.$patch',
  '.$remove',
  '.get',
  '.get + $select',
  '.get + id + query',
  '.get + NotFound',
  '.get + id + query id',
  '.find',
  '.find + paginate + query',
  '.remove',
  '.remove + $select',
  '.remove + id + query',
  '.remove + multi',
  '.remove + multi no pagination',
  '.remove + id + query id',
  '.update',
  '.update + $select',
  '.update + id + query',
  '.update + NotFound',
  '.update + id + query id',
  '.update + query + NotFound',
  '.patch',
  '.patch + $select',
  '.patch + id + query',
  '.patch multiple',
  '.patch multiple no pagination',
  '.patch multi query same',
  '.patch multi query changed',
  '.patch + query + NotFound',
  '.patch + NotFound',
  '.patch + id + query id',
  '.create',
  '.create + $select',
  '.create multi',
  'internal .find',
  'internal .get',
  'internal .create',
  'internal .update',
  'internal .patch',
  'internal .remove',
  '.find + equal',
  '.find + equal multiple',
  '.find + $sort',
  '.find + $sort + string',
  '.find + $limit',
  '.find + $limit 0',
  '.find + $skip',
  '.find + $select',
  '.find + $or',
  '.find + $in',
  '.find + $nin',
  '.find + $lt',
  '.find + $lte',
  '.find + $gt',
  '.find + $gte',
  '.find + $ne',
  '.find + $gt + $lt + $sort',
  '.find + $or nested + $sort',
  '.find + paginate',
  '.find + paginate + $limit + $skip',
  '.find + paginate + $limit 0',
  '.find + paginate + params',
  'params.adapter + paginate',
  'params.adapter + multi'
])

describe('Feathers MongoDB Service', () => {
  type Person = {
    _id: string
    name: string
    age: number,
    friends?: string[],
    team: string,
    $push: {
      friends: string
    }
  }

  type ServiceTypes = {
    people: MongoDBService<Person>,
    'people-customid': MongoDBService<Person>,
  }

  const app = feathers<ServiceTypes>()

  let db: Db
  let mongoClient: MongoClient

  before(async () => {
    const client = await MongoClient.connect('mongodb://localhost:27017/feathers-test')

    mongoClient = client
    db = client.db('feathers-test')

    app.use('people', new MongoDBService({
      Model: db.collection('people-customid'),
      events: ['testing']
    }))
    app.use('people-customid', new MongoDBService({
      Model: db.collection('people-customid'),
      id: 'customid',
      events: ['testing']
    }))

    app.service('people').Model = db.collection('people')

    db.collection('people-customid').deleteMany({})
    db.collection('people').deleteMany({})
    db.collection('todos').deleteMany({})

    db.collection('people').createIndex(
      { name: 1 },
      { partialFilterExpression: { team: 'blue' } }
    )
  })

  after(async () => {
    await db.dropDatabase();
    await mongoClient.close();
  })

  describe('Service utility functions', () => {
    describe('getObjectId', () => {
      it('returns an ObjectID instance for a valid ID', () => {
        const id = new ObjectId()
        const objectify = app.service('people').getObjectId(id.toString())

        assert.ok(objectify instanceof ObjectId)
        assert.strictEqual(objectify.toString(), id.toString())
      })

      it('returns an ObjectID instance for a valid ID', () => {
        const id = 'non-valid object id'
        const objectify = app.service('people').getObjectId(id.toString())

        assert.ok(!(objectify instanceof ObjectId))
        assert.strictEqual(objectify, id)
      })
    })
  })

  describe('Special collation param', () => {
    let peopleService: MongoDBService<Person>;
    let people: Person[];

    function indexOfName (results: Person[], name: string) {
      let index = 0;

      for (const person of results) {
        if (person.name === name) {
          return index
        }
        index++;
      }

      return -1;
    }

    beforeEach(async () => {
      peopleService = app.service('people')
      peopleService.options.multi = true
      peopleService.options.disableObjectify = true
      people = await peopleService.create([
        { name: 'AAA' }, { name: 'aaa' }, { name: 'ccc' }
      ])
    })

    afterEach(async () => {
      peopleService.options.multi = false
      await Promise.all([
        peopleService.remove(people[0]._id),
        peopleService.remove(people[1]._id),
        peopleService.remove(people[2]._id)
      ]).catch(() => {})
    })

    it('queries for ObjectId in find', async () => {
      const person = await peopleService.create({ name: 'Coerce' })
      const results = await peopleService.find({
        paginate: false,
        query: {
          _id: new ObjectId(person._id)
        }
      })

      assert.strictEqual(results.length, 1)

      await peopleService.remove(person._id)
    })

    it('works with normal string _id', async () => {
      const person = await peopleService.create({
        _id: 'lessonKTDA08',
        name: 'Coerce'
      })
      const result = await peopleService.get(person._id)

      assert.strictEqual(result.name, 'Coerce')

      await peopleService.remove(person._id)
    })

    it('sorts with default behavior without collation param', async () => {
      const results = await peopleService.find({
        paginate: false,
        query: { $sort: { name: -1 } }
      })

      assert.ok(indexOfName(results, 'aaa') < indexOfName(results, 'AAA'))
    })

    it('sorts using collation param if present', async () => {
      const results = await peopleService.find({
        paginate: false,
        query: { $sort: { name: -1 } },
        mongodb: { collation: { locale: 'en', strength: 1 } }
      })

      assert.ok(indexOfName(results, 'aaa') > indexOfName(results, 'AAA'))
    })

    it('removes with default behavior without collation param', async () => {
      await peopleService.remove(null, { query: { name: { $gt: 'AAA' } } })

      const results = await peopleService.find({ paginate: false })

      assert.strictEqual(results.length, 1)
      assert.strictEqual(results[0].name, 'AAA')
    })

    it('removes using collation param if present', async () => {
      const removed = await peopleService.remove(null, {
        query: { name: 'AAA' },
        mongodb: { collation: { locale: 'en', strength: 1 } }
      })
      const results = await peopleService.find({ paginate: false })

      assert.strictEqual(removed.length, 2)
      assert.strictEqual(results[0].name, 'ccc')
      assert.strictEqual(results.length, 1)
    })

    it('updates with default behavior without collation param', async () => {
      const query = { name: { $gt: 'AAA' } }

      const result = await peopleService.patch(null, { age: 99 }, { query })

      assert.strictEqual(result.length, 2)
      result.forEach(person => {
        assert.strictEqual(person.age, 99)
      })
    })

    it('updates using collation param if present', async () => {
      const result = await peopleService.patch(null, { age: 110 }, {
        query: { name: { $gt: 'AAA' } },
        mongodb: { collation: { locale: 'en', strength: 1 } }
      })

      assert.strictEqual(result.length, 1)
      assert.strictEqual(result[0].name, 'ccc')
    })

    it('pushes to an array using patch', async () => {
      const result = await peopleService.patch(null, { $push: { friends: 'Adam' } }, {
        query: { name: { $gt: 'AAA' } }
      })

      assert.strictEqual(result[0].friends.length, 1)

      const patched = await peopleService.patch(null, {
        $push: { friends: 'Bell' }
      }, { query: { name: { $gt: 'AAA' } } })

      assert.strictEqual(patched[0].friends.length, 2)
    })

    it('overrides default index selection using hint param if present', async () => {
      const indexed = await peopleService.create({ name: 'Indexed', team: 'blue' })

      const result = await peopleService.find({
        paginate: false,
        query: {},
        mongodb: { hint: { name: 1 } }
      })

      assert.strictEqual(result[0].name, 'Indexed')
      assert.strictEqual(result.length, 1)

      await peopleService.remove(indexed._id)
    })
  })

  testSuite(app, errors, 'people', '_id')
  testSuite(app, errors, 'people-customid', 'customid')
})
