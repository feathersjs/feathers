// deno-lint-ignore-file require-await
import {
  AdapterBase,
  AdapterParams,
  InternalServiceMethods,
  PaginationOptions,
} from "../mod.ts";
import { Id, NullableId, Paginated } from "../../feathers/mod.ts";

export type Data = {
  id: Id;
};

export class MethodBase
  extends AdapterBase<Data, Partial<Data>, AdapterParams>
  implements InternalServiceMethods<Data>
{
  async $find(
    _params?: AdapterParams & { paginate?: PaginationOptions }
  ): Promise<Paginated<Data>>;
  async $find(_params?: AdapterParams & { paginate: false }): Promise<Data[]>;
  async $find(params?: AdapterParams): Promise<Data | Data[] | Paginated<Data>>;
  async $find(
    params?: AdapterParams
  ): Promise<Data | Data[] | Paginated<Data>> {
    if (params && params.paginate === false) {
      return {
        total: 0,
        limit: 10,
        skip: 0,
        data: [],
      };
    }

    return [];
  }

  async $get(id: Id, _params?: AdapterParams): Promise<Data> {
    return { id };
  }

  async $create(
    data: Partial<Data>[],
    _params?: AdapterParams
  ): Promise<Data[]>;
  async $create(data: Partial<Data>, _params?: AdapterParams): Promise<Data>;
  async $create(
    data: Partial<Data> | Partial<Data>[],
    _params?: AdapterParams
  ): Promise<Data | Data[]> {
    if (Array.isArray(data)) {
      return [
        {
          id: "something",
        },
      ];
    }

    return {
      id: "something",
      ...data,
    };
  }

  async create(
    data: Partial<Data> | Partial<Data>[],
    params?: AdapterParams
  ): Promise<Data | Data[]> {
    return this._create(data, params);
  }

  async $update(id: NullableId, _data: Data, _params?: AdapterParams) {
    return Promise.resolve({ id } as Data);
  }

  async $patch(
    id: null,
    _data: Partial<Data>,
    _params?: AdapterParams
  ): Promise<Data[]>;
  async $patch(
    id: Id,
    _data: Partial<Data>,
    _params?: AdapterParams
  ): Promise<Data>;
  async $patch(
    id: NullableId,
    _data: Partial<Data>,
    _params?: AdapterParams
  ): Promise<Data | Data[]> {
    if (id === null) {
      return [];
    }

    return { id };
  }

  async $remove(id: null, _params?: AdapterParams): Promise<Data[]>;
  async $remove(id: Id, _params?: AdapterParams): Promise<Data>;
  async $remove(id: NullableId, _params?: AdapterParams) {
    if (id === null) {
      return [] as Data[];
    }

    return { id };
  }
}

export class MethodService extends MethodBase {
  find(params?: AdapterParams): Promise<Data | Data[] | Paginated<Data>> {
    return this._find(params);
  }

  get(id: Id, params?: AdapterParams): Promise<Data> {
    return this._get(id, params);
  }

  async update(id: Id, data: Data, params?: AdapterParams) {
    return this._update(id, data, params);
  }

  async patch(id: NullableId, data: Partial<Data>, params?: AdapterParams) {
    return this._patch(id, data, params);
  }

  async remove(id: NullableId, params?: AdapterParams) {
    return this._remove(id, params);
  }
}
