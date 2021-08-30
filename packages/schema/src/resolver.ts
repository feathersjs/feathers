import { BadRequest } from '@feathersjs/errors';

export type PropertyResolver<V, T, C> = (value: V|undefined, obj: T, context: C) => Promise<V|undefined>;

export type PropertyResolverMap<T, C> = {
  [key in keyof T]?: PropertyResolver<T[key], T, C>
}

export interface ResolverOptions<T, C> {
  properties: PropertyResolverMap<T, C>
}

export class Resolver<T, C> {
  readonly _type!: T;

  constructor (public options: ResolverOptions<T, C>) {
  }

  convertErrors (results: PromiseSettledResult<void>[], names: string[]) {
    const data = results.reduce((res, value, index) => {
      if (value.status === 'rejected') {
        const name = names[index];
        const data = typeof value.reason.toJSON === 'function'
          ? value.reason.toJSON()
          : { message: value.reason.message || value };

        res[name] = data;
      }

      return res;
    }, {} as any);

    return new BadRequest('Error resolving data', data);
  }

  async resolve<D> (data: D, context?: C): Promise<T> {
    const result: any = { ...data };
    const { properties } = this.options;
    const names = Object.keys(properties);
    const results = await Promise.allSettled(names.map(async name => {
      const resolver = (properties as any)[name];
      const value = (data as any)[name];
      const resolved = await resolver(value, data, context);

      if (resolved === undefined) {
        delete result[name];
      } else {
        result[name] = resolved;
      }
    }));
    const hasErrors = results.some(({ status }) => status === 'rejected');

    if (hasErrors) {
      throw this.convertErrors(results, names);
    }

    return result;
  }
}

export function resolve <T, C> (options: ResolverOptions<T, C>) {
  return new Resolver<T, C>(options);
}
