import { AdapterBase, AdapterParams, PaginationOptions } from '../src'
import { Id, NullableId, Paginated } from '@feathersjs/feathers'

export type Data = {
  id: Id
}

export class MethodBase extends AdapterBase<Data, Data, Partial<Data>, AdapterParams> {
  async _find(_params?: AdapterParams & { paginate?: PaginationOptions }): Promise<Paginated<Data>>
  async _find(_params?: AdapterParams & { paginate: false }): Promise<Data[]>
  async _find(params?: AdapterParams): Promise<Data | Data[] | Paginated<Data>> {
    if (params && params.paginate === false) {
      return []
    }

    return {
      total: 0,
      limit: 10,
      skip: 0,
      data: []
    }
  }

  async _get(id: Id, _params?: AdapterParams): Promise<Data> {
    return { id }
  }

  async _create(data: Data, _params?: AdapterParams): Promise<Data>
  async _create(data: Data[], _params?: AdapterParams): Promise<Data[]>
  async _create(data: Data | Data[], _params?: AdapterParams): Promise<Data | Data[]>
  async _create(data: Data | Data[], _params?: AdapterParams): Promise<Data | Data[]> {
    if (Array.isArray(data)) {
      return [
        {
          id: 'something'
        }
      ]
    }

    return {
      id: 'something'
    }
  }

  async create(data: Data[], _params?: AdapterParams): Promise<Data[]>
  async create(data: Data, _params?: AdapterParams): Promise<Data>
  async create(data: Data | Data[], params?: AdapterParams): Promise<Data | Data[]> {
    return this._create(data, params)
  }

  async _update(id: Id, _data: Data, _params?: AdapterParams) {
    return Promise.resolve({ id: id ?? _data.id })
  }

  async _patch(id: null, _data: Partial<Data>, _params?: AdapterParams): Promise<Data[]>
  async _patch(id: Id, _data: Partial<Data>, _params?: AdapterParams): Promise<Data>
  async _patch(id: NullableId, _data: Partial<Data>, _params?: AdapterParams): Promise<Data | Data[]>
  async _patch(id: NullableId, _data: Partial<Data>, _params?: AdapterParams): Promise<Data | Data[]> {
    if (id === null) {
      return []
    }

    return { id }
  }

  async _remove(id: null, _params?: AdapterParams): Promise<Data[]>
  async _remove(id: Id, _params?: AdapterParams): Promise<Data>
  async _remove(id: NullableId, _params?: AdapterParams): Promise<Data | Data[]>
  async _remove(id: NullableId, _params?: AdapterParams) {
    if (id === null) {
      return [] as Data[]
    }

    return { id }
  }
}

export class MethodService extends MethodBase {
  find(params?: AdapterParams): Promise<Data | Data[] | Paginated<Data>> {
    return this._find(params)
  }

  get(id: Id, params?: AdapterParams): Promise<Data> {
    return this._get(id, params)
  }

  async update(id: Id, data: Data, params?: AdapterParams) {
    return this._update(id, data, params)
  }

  async patch(id: NullableId, data: Partial<Data>, params?: AdapterParams) {
    return this._patch(id, data, params)
  }

  async remove(id: NullableId, params?: AdapterParams) {
    return this._remove(id, params)
  }
}
