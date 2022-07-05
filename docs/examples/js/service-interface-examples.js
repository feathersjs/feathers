import { feathers, Params, Id, NullableId } from '@feathersjs/feathers'

class MyServiceClass {
  async find(params) {
    return []
  }
  async get(id, params) {}
  async create(data, params) {}
  async update(id, data, params) {}
  async patch(id, data, params) {}
  async remove(id, params) {}
  async setup(app, path) {}
  async teardown(app, path) {}
}

const myServiceObject = {
  async find(params) {
    return []
  },
  async get(id, params) {},
  async create(data, params) {},
  async update(id, data, params) {},
  async patch(id, data, params) {},
  async remove(id, params) {},
  async setup(app, path) {},
  async teardown(app, path) {}
}

const app = feathers()

app.use('my-service', new MyService())
app.use('my-service-object', myServiceObject)
