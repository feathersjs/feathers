import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const dogSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      resolve (value: string) {
        return value;
      } 
    },
    age: { type: 'integer' },
    hobbies: { type: 'array', items: { type: 'string' } },
    favoriteFood: { enum: ['pizza', 'taco', 'fries'] },
  },
  required: ['name', 'age'],
} as const;

type Dog = FromSchema<typeof dogSchema>;

type Resolver<T, C, O = any> = (obj: O, context: C) => Promise<T>;
type PropertyResolver<V, T, C, O = any> = (value: V, obj: O, context: C) => Promise<T>;

export class Schema<S extends JSONSchema, C, T = FromSchema<S>> {
  constructor (
    public definition: S,
    public resolvers: Resolver<T, C>[]
  ) {}

  async resolve (obj: any, context: C) {
    let result = obj;

    for (const resolve of this.resolvers) {
      result = await resolve(result, context);
    }

    return result;
  }
}

export function hello () {
  return 'Hello';
}

export function schema <S> (schema: S extends JSONSchema) {

}
