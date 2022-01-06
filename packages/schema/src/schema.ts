import Ajv, { AsyncValidateFunction, ValidateFunction } from 'ajv';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

export const AJV = new Ajv({
  coerceTypes: true
});

export type JSONSchemaDefinition = JSONSchema & { $id: string, $async?: boolean };

export class Schema<S extends JSONSchemaDefinition> {
  ajv: Ajv;
  validator: AsyncValidateFunction;
  readonly _type!: FromSchema<S>;

  constructor (public definition: S, ajv: Ajv = AJV) {
    this.ajv = ajv;
    this.validator = this.ajv.compile({
      $async: true,
      ...(this.definition as any)
    }) as AsyncValidateFunction;
  }

  validate <T = FromSchema<S>> (...args: Parameters<ValidateFunction<T>>) {
    return this.validator(...args) as any as Promise<T>;
  }

  toJSON () {
    return this.definition;
  }
}

export function schema <S extends JSONSchemaDefinition> (definition: S, ajv: Ajv = AJV) {
  return new Schema(definition, ajv);
}
