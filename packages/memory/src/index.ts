import { NotFound } from '@feathersjs/errors';
import { _ } from '@feathersjs/commons';
import { sorter, select, AdapterBase, AdapterServiceOptions, PaginationOptions } from '@feathersjs/adapter-commons';
import sift from 'sift';
import { NullableId, Id, Params, ServiceMethods, Paginated } from '@feathersjs/feathers';

export interface MemoryServiceStore<T> {
  [key: string]: T;
}

export interface MemoryServiceOptions<T = any> extends AdapterServiceOptions {
  store: MemoryServiceStore<T>;
  startId: number;
  matcher?: (query: any) => any;
  sorter?: (sort: any) => any;
}

const _select = (data: any, params: any, ...args: any[]) => {
  const base = select(params, ...args);

  return base(JSON.parse(JSON.stringify(data)));
};

export class MemoryAdapter<T = any, D = Partial<T>, P extends Params = Params> extends AdapterBase<T, D, P, MemoryServiceOptions<T>> {
  store: MemoryServiceStore<T>;
  _uId: number;

  constructor (options: Partial<MemoryServiceOptions<T>> = {}) {
    super({
      id: 'id',
      matcher: sift,
      sorter,
      store: {},
      startId: 0,
      ...options
    });
    this._uId = this.options.startId;
    this.store = { ...this.options.store };
  }

  async getEntries (_params?: P) {
    const params = _params || {} as P;

    return this.$find({
      ...params,
      paginate: false
    });
  }

  getQuery (params: P) {
    const { $skip, $sort, $limit, $select, ...query } = params.query || {};

    return {
      query,
      filters: { $skip, $sort, $limit, $select }
    }
  }

  async $find (_params?: P & { paginate?: PaginationOptions }): Promise<Paginated<T>>;
  async $find (_params?: P & { paginate: false }): Promise<T[]>;
  async $find (_params?: P): Promise<Paginated<T>|T[]>;
  async $find (params: P = {} as P): Promise<Paginated<T>|T[]> {
    const { paginate } = this.getOptions(params);
    const { query, filters } = this.getQuery(params);

    let values = _.values(this.store).filter(this.options.matcher(query));
    const total = values.length;

    if (filters.$sort !== undefined) {
      values.sort(this.options.sorter(filters.$sort));
    }

    if (filters.$skip !== undefined) {
      values = values.slice(filters.$skip);
    }

    if (filters.$limit !== undefined) {
      values = values.slice(0, filters.$limit);
    }

    const result: Paginated<T> = {
      total,
      limit: filters.$limit,
      skip: filters.$skip || 0,
      data: values.map(value => _select(value, params))
    };

    if (!paginate) {
      return result.data;
    }

    return result;
  }

  async $get (id: Id, params: P = {} as P): Promise<T> {
    const { query } = this.getQuery(params);

    if (id in this.store) {
      const value = this.store[id];

      if (this.options.matcher(query)(value)) {
        return _select(value, params, this.id);
      }
    }

    throw new NotFound(`No record found for id '${id}'`);
  }

  async $create (data: Partial<D>, params?: P): Promise<T>;
  async $create (data: Partial<D>[], params?: P): Promise<T[]>;
  async $create (data: Partial<D>|Partial<D>[], _params?: P): Promise<T|T[]>;
  async $create (data: Partial<D>|Partial<D>[], params: P = {} as P): Promise<T|T[]> {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.$create(current, params)));
    }

    const id = (data as any)[this.id] || this._uId++;
    const current = _.extend({}, data, { [this.id]: id });
    const result = (this.store[id] = current);

    return _select(result, params, this.id) as T;
  }

  async $update (id: Id, data: D, params: P = {} as P): Promise<T> {
    const oldEntry = await this.$get(id);
    // We don't want our id to change type if it can be coerced
    const oldId = (oldEntry as any)[this.id];

    // eslint-disable-next-line eqeqeq
    id = oldId == id ? oldId : id;

    this.store[id] = _.extend({}, data, { [this.id]: id });

    return this.$get(id, params);
  }

  async $patch (id: null, data: Partial<D>, params?: P): Promise<T[]>;
  async $patch (id: Id, data: Partial<D>, params?: P): Promise<T>;
  async $patch (id: NullableId, data: Partial<D>, _params?: P): Promise<T|T[]>;
  async $patch (id: NullableId, data: Partial<D>, params: P = {} as P): Promise<T|T[]> {
    const { query } = this.getQuery(params);
    const patchEntry = (entry: T) => {
      const currentId = (entry as any)[this.id];

      this.store[currentId] = _.extend(this.store[currentId], _.omit(data, this.id));

      return _select(this.store[currentId], params, this.id);
    };

    if (id === null) {
      const entries = await this.getEntries({
        ...params,
        query
      });

      return entries.map(patchEntry);
    }

    return patchEntry(await this.$get(id, params)); // Will throw an error if not found
  }

  async $remove (id: null, params?: P): Promise<T[]>;
  async $remove (id: Id, params?: P): Promise<T>;
  async $remove (id: NullableId, _params?: P): Promise<T|T[]>;
  async $remove (id: NullableId, params: P = {} as P): Promise<T|T[]>  {
    const { query } = this.getQuery(params);

    if (id === null) {
      const entries = await this.getEntries({
        ...params,
        query
      });

      return Promise.all(entries.map((current: any) =>
        this.$remove(current[this.id] as Id, params)
      ));
    }

    const entry = await this.$get(id, params);

    delete this.store[id];

    return entry;
  }
}

export class MemoryService<T = any, D = Partial<T>, P extends Params = Params>
    extends MemoryAdapter<T, D, P> implements ServiceMethods<T|Paginated<T>, D, P> {
  async find (params?: P & { paginate?: PaginationOptions }): Promise<Paginated<T>>;
  async find (params?: P & { paginate: false }): Promise<T[]>;
  async find (params?: P): Promise<Paginated<T>|T[]>;
  async find (params?: P): Promise<Paginated<T>|T[]> {
    return this._find(params) as any;
  }

  async get (id: Id, params?: P): Promise<T> {
    return this._get(id, params);
  }

  async create (data: Partial<D>, params?: P): Promise<T>;
  async create (data: Partial<D>[], params?: P): Promise<T[]>;
  async create (data: Partial<D>|Partial<D>[], params?: P): Promise<T|T[]> {
    return this._create(data, params);
  }

  async update (id: Id, data: D, params?: P): Promise<T> {
    return this._update(id, data, params);
  }

  async patch (id: Id, data: Partial<D>, params?: P): Promise<T>;
  async patch (id: null, data: Partial<D>, params?: P): Promise<T[]>;
  async patch (id: NullableId, data: Partial<D>, params?: P): Promise<T | T[]> {
    return this._patch(id, data, params);
  }

  async remove (id: Id, params?: P): Promise<T>;
  async remove (id: null, params?: P): Promise<T[]>;
  async remove (id: NullableId, params?: P): Promise<T | T[]> {
    return this._remove(id, params);
  }
}

export function memory<T = any, D = Partial<T>, P extends Params = Params> (
  options: Partial<MemoryServiceOptions<T>> = {}
) {
  return new MemoryService<T, D, P>(options)
}
