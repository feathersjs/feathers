import { NotFound } from '@feathersjs/errors';
import { _ } from '@feathersjs/commons';
import { sorter, select, AdapterService, ServiceOptions, InternalServiceMethods } from '@feathersjs/adapter-commons';
import sift from 'sift';
import { Params, NullableId, Id } from '@feathersjs/feathers';

export interface MemoryServiceStore<T> {
  [key: string]: T;
}

export interface MemoryServiceOptions<T = any> extends ServiceOptions {
  store: MemoryServiceStore<T>;
  startId: number;
  matcher?: (query: any) => any;
  sorter?: (sort: any) => any;
}

const _select = (data: any, params: any, ...args: any[]) => {
  const base = select(params, ...args);

  return base(JSON.parse(JSON.stringify(data)));
};

export class MemoryService<T = any> extends AdapterService<T> implements InternalServiceMethods<T> {
  options: MemoryServiceOptions;
  store: MemoryServiceStore<T>;
  _uId: number;

  constructor (options: Partial<MemoryServiceOptions<T>> = {}) {
    super(_.extend({
      id: 'id',
      matcher: sift,
      sorter
    }, options));
    this._uId = options.startId || 0;
    this.store = options.store || {};
  }

  async getEntries (params = {}) {
    const { query } = this.filterQuery(params);

    return this._find(Object.assign({}, params, {
      paginate: false,
      query
    }) as any) as Promise<T[]>;
  }

  async _find (params: Params = {}) {
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

    const result = {
      total,
      limit: filters.$limit,
      skip: filters.$skip || 0,
      data: values.map(value => _select(value, params))
    };

    if (!(paginate && (paginate as any).default)) {
      return result.data;
    }

    return result;
  }

  async _get (id: Id, params: Params = {}) {
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
  async _create (data: Partial<T> | Partial<T>[], params: Params = {}): Promise<T | T[]> {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this._create(current, params) as Promise<T>));
    }

    const id = (data as any)[this.id] || this._uId++;
    const current = _.extend({}, data, { [this.id]: id });
    const result = (this.store[id] = current);

    return _select(result, params, this.id);
  }

  async _update (id: NullableId, data: T, params: Params = {}) {
    const oldEntry = await this._get(id);
    // We don't want our id to change type if it can be coerced
    const oldId = oldEntry[this.id];

    // tslint:disable-next-line
    id = oldId == id ? oldId : id; 

    this.store[id] = _.extend({}, data, { [this.id]: id });

    return this._get(id, params);
  }

  async _patch (id: NullableId, data: Partial<T>, params: Params = {}) {
    const patchEntry = (entry: T) => {
      const currentId = (entry as any)[this.id];

      this.store[currentId] = _.extend(this.store[currentId], _.omit(data, this.id));

      return _select(this.store[currentId], params, this.id);
    };

    if (id === null) {
      const entries = await this.getEntries(params);

      return entries.map(patchEntry);
    }

    return patchEntry(await this._get(id, params)); // Will throw an error if not found
  }

  // Remove without hooks and mixins that can be used internally
  async _remove (id: NullableId, params: Params = {}): Promise<T|T[]> {
    if (id === null) {
      const entries = await this.getEntries(params);

      return Promise.all(entries.map(current =>
        this._remove((current as any)[this.id], params) as Promise<T>
      ));
    }

    const entry = await this._get(id, params);

    delete this.store[id];

    return entry;
  }
}

export function memory (options: Partial<MemoryServiceOptions> = {}) {
  return new MemoryService(options);
}
