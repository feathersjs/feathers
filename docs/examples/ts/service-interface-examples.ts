import { feathers, Params, Id, NullableId } from '@feathersjs/feathers'

class MyServiceClass {
  async find(params: Params) {
    return []
  }
  async get(id: Id, params: Params) {}
  async create(data: any, params: Params) {}
  async update(id: NullableId, data: any, params: Params) {}
  async patch(id: NullableId, data: any, params: Params) {}
  async remove(id: NullableId, params: Params) {}
  async setup(app: Application, path: string) {}
  async teardown(app: Application, path: string) {}
}

const myServiceObject = {
  async find(params: Params) {
    return []
  },
  async get(id: Id, params: Params) {},
  async create(data: any, params: Params) {},
  async update(id: NullableId, data: any, params: Params) {},
  async patch(id: NullableId, data: any, params: Params) {},
  async remove(id: NullableId, params: Params) {},
  async setup(app: Application, path: string) {},
  async teardown(app: Application, path: string) {}
}

type ServiceTypes = {
  'my-service': MyServiceClass
  'my-service-object': typeof myServiceObject
}

const app = feathers<ServiceTypes>()

app.use('my-service', new MyService())
app.use('my-service-object', myServiceObject)
