---
to: "<%= h.lib %>/services/<%= path %>.ts"
inject: true
after: "The <%= className %> service class"
---
interface Data {}
interface Options {
  app: Application;
  paginate: any;
}

class <%= className %> implements Partial<ServiceMethods<Data>> {
  options: Options;

  constructor (options: Options) {
    this.options = options;
  }

  async find (params?: Params): Promise<Data[]> {
    return [];
  }

  async get (id: Id, params?: Params): Promise<Data> {
    return {
      id, text: `A new message with ID: ${id}!`
    };
  }

  async create (data: Data, params?: Params): Promise<Data> {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }

    return data;
  }

  async update (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  async patch (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  async remove (id: NullableId, params?: Params): Promise<Data> {
    return { id };
  }
}
