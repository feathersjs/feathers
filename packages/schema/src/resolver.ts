import { BadRequest } from '@feathersjs/errors';

export type PropertyResolver = (value: any, obj: any, context: any) => any;

export type PropertyResolverMap = {
  [key: string]: PropertyResolver;
}

export interface ResolverOptions {
  properties: PropertyResolverMap
}

export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

export type FromResolver<R extends ResolverOptions> = {
  [K in keyof R['properties']]: ThenArg<ReturnType<R['properties'][K]>>
}

export class Resolver<R extends ResolverOptions = any, C = any> {
  readonly _type!: FromResolver<R>;

  constructor (public options: R) {
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

  async resolve<D> (data: D, context?: C): Promise<FromResolver<R> & D> {
    const result: any = { ...data };
    const { properties } = this.options;
    const names = Object.keys(properties);
    const results = await Promise.allSettled(names.map(async name => {
      const resolver = properties[name];
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

export function resolve <R extends ResolverOptions> (options: R) {
  return new Resolver(options);
}
