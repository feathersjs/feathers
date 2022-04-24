import { MethodNotAllowed, NotFound } from '@feathersjs/errors';
import { _ } from '@feathersjs/commons';
import {
  sorter, select, AdapterBase, AdapterServiceOptions, InternalServiceMethods,
  PaginationOptions, AdapterParams, FilterQueryOptions
} from '@feathersjs/adapter-commons';
import sift from 'sift';
import { NullableId, Id, Params, ServiceMethods, Paginated, Query } from '@feathersjs/feathers';

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

export class MemoryAdapter<T = any, D = Partial<T>, P extends Params = Params> extends AdapterBase<MemoryServiceOptions<T>>
    implements InternalServiceMethods<T, D, P> {
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
    const { query } = this.filterQuery(params);

    return this._find({
      ...params,
      paginate: false,
      query
    });
  }

  filterQuery (params?: AdapterParams<Query, any>, opts?: FilterQueryOptions) {
    const result = super.filterQuery(params, opts);
    const { query, filters } = result;

    // $or is not treated as a filter but needs to be part of the query to work with SiftJS
    result.query = {
      ...query,
      ...(filters.$or ? { $or: filters.$or } : {})
    }

    return result;
  }

  async _find (_params?: P & { paginate?: PaginationOptions }): Promise<Paginated<T>>;
  async _find (_params?: P & { paginate: false }): Promise<T[]>;
  async _find (_params?: P): Promise<Paginated<T>|T[]>;
  async _find (_params?: P): Promise<Paginated<T>|T[]> {
    const params = _params || {} as P;
    const { query, filters, paginate } = this.filterQuery(params);
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

    if (!(paginate && paginate.default)) {
      return result.data;
    }

    return result;
  }

  async _get (id: Id, _params?: P): Promise<T> {
    const params = _params || {} as P;

    if (id in this.store) {
      const { query } = this.filterQuery(params);
      const value = this.store[id];

      if (this.options.matcher(query)(value)) {
        return _select(value, params, this.id);
      }
    }

    throw new NotFound(`No record found for id '${id}'`);
  }

  // Create without hooks and mixins that can be used internally
  async _create (data: Partial<D>, params?: P): Promise<T>;
  async _create (data: Partial<D>[], params?: P): Promise<T[]>;
  async _create (data: Partial<D>|Partial<D>[], _params?: P): Promise<T|T[]>;
  async _create (data: Partial<D>|Partial<D>[], _params?: P): Promise<T|T[]> {
    const params = _params || {} as P;

    if (Array.isArray(data)) {
      if (!this.allowsMulti('create', params)) {
        throw new MethodNotAllowed('Can not create multiple entries');
      }

      return Promise.all(data.map(current => this._create(current, params)));
    }

    const id = (data as any)[this.id] || this._uId++;
    const current = _.extend({}, data, { [this.id]: id });
    const result = (this.store[id] = current);

    return _select(result, params, this.id) as T;
  }

  async _update (id: Id, data: D, params: P = {} as P): Promise<T> {
    if (id === null || Array.isArray(data)) {
      throw new MethodNotAllowed('You can not replace multiple instances. Did you mean \'patch\'?');
    }

    const oldEntry = await this._get(id);
    // We don't want our id to change type if it can be coerced
    const oldId = (oldEntry as any)[this.id];

    // eslint-disable-next-line eqeqeq
    id = oldId == id ? oldId : id;

    this.store[id] = _.extend({}, data, { [this.id]: id });

    return this._get(id, params);
  }

  async _patch (id: null, data: Partial<D>, params?: P): Promise<T[]>;
  async _patch (id: Id, data: Partial<D>, params?: P): Promise<T>;
  async _patch (id: NullableId, data: Partial<D>, _params?: P): Promise<T|T[]>;
  async _patch (id: NullableId, data: Partial<D>, _params?: P): Promise<T|T[]> {
    const params = _params || {} as P;
    const patchEntry = (entry: T) => {
      const currentId = (entry as any)[this.id];

      this.store[currentId] = _.extend(this.store[currentId], _.omit(data, this.id));

      return _select(this.store[currentId], params, this.id);
    };

    if (id === null) {
      if(!this.allowsMulti('patch', params)) {
        throw new MethodNotAllowed('Can not patch multiple entries');
      }

      const entries = await this.getEntries(params);

      return entries.map(patchEntry);
    }

    return patchEntry(await this._get(id, params)); // Will throw an error if not found
  }

  // Remove without hooks and mixins that can be used internally
  async _remove (id: null, params?: P): Promise<T[]>;
  async _remove (id: Id, params?: P): Promise<T>;
  async _remove (id: NullableId, _params?: P): Promise<T|T[]>;
  async _remove (id: NullableId, _params?: P): Promise<T|T[]>  {
    const params = _params || {} as P;

    if (id === null) {
      if(!this.allowsMulti('remove', params)) {
        throw new MethodNotAllowed('Can not remove multiple entries');
      }

      const entries = await this.getEntries(params);

      return Promise.all(entries.map(current =>
        this._remove((current as any)[this.id] as Id, params)
      ));
    }

    const entry = await this._get(id, params);

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
    return this._find(params)
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