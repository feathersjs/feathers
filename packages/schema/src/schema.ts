import Ajv, { AsyncValidateFunction, ValidateFunction } from 'ajv';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { BadRequest } from '@feathersjs/errors';

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

  async validate <T = FromSchema<S>> (...args: Parameters<ValidateFunction<T>>) {
    try {
      const validated = await this.validator(...args) as T;

      return validated;
    } catch (error: any) {
      throw new BadRequest(error.message, error.errors);
    }
  }

  toJSON () {
    return this.definition;
  }
}

export function schema <S extends JSONSchemaDefinition> (definition: S, ajv: Ajv = AJV) {
  return new Schema(definition, ajv);
}
