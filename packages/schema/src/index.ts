import Ajv, { AsyncValidateFunction } from 'ajv';
import { JSONSchema6 } from 'json-schema';
import { getServiceOptions, HookContext, NextFunction } from '@feathersjs/feathers';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

export type Infer<T extends { _type: any }> = T['_type'];

export type PropertyResolver = (value: any, obj: any, context: any) => any;

export type PropertyResolverMap = {
  [key: string]: PropertyResolver;
}

export class Schema<S extends JSONSchema> {
  ajv: Ajv;
  validate: AsyncValidateFunction;
  definition: JSONSchema6;
  resolvers: PropertyResolverMap;
  readonly _type!: FromSchema<S>;

  constructor (definition: S, ajv: Ajv = new Ajv({
    coerceTypes: true,
    strict: false
  })) {
    this.ajv = ajv;
    this.definition = definition as JSONSchema6;
    this.validate = this.ajv.compile({
      $async: true,
      ...this.definition
    });

    const { properties } = this.definition;

    this.resolvers = Object.keys(properties).reduce((res, name) => {
      const { resolve } = properties[name] as any;

      if (typeof resolve === 'function') {
        res[name] = resolve;
      }

      return res;
    }, {} as PropertyResolverMap);
  }

  async resolve (obj: any, context?: any) {
    const data: any = await this.validate(obj);
    const result = { ...data };

    await Promise.all(Object.keys(this.resolvers).map(async name => {
      const resolved = await this.resolvers[name](data[name], data, context);

      if (resolved === undefined) {
        delete result[name];
      } else {
        result[name] = resolved;
      }
    }));

    return result as Infer<Schema<S>>;
  }
}

export function schema <S extends JSONSchema> (schema: S) {
  return new Schema(schema);
}

export function resolveSchemas () {
  return async (context: HookContext, next: NextFunction) => {
    const { params: { query = {} }, data } = context;
    const { schema = {} } = getServiceOptions(context.service);

    if (schema.query) {
      context.params.query = await schema.query.resolve(query, context);
    }

    if (schema.data && data !== undefined) {
      context.data = await schema.data.resolve(data, context);
    }

    await next();

    if (schema.result) {
      context.result = await schema.result.resolve(context.result, context);
    }
  }
}

declare module '@feathersjs/feathers/lib/declarations' {
  export interface ServiceOptions {
    schema?: {
      query?: Schema<any>,
      data?: Schema<any>,
      result?: Schema<any>
    }
  }
}
