import Ajv, { AsyncValidateFunction } from 'ajv';
import { JSONSchema6 } from 'json-schema';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

export class Schema<S extends JSONSchema> {
  ajv: Ajv;
  validate: AsyncValidateFunction<FromSchema<S>>;
  definition: JSONSchema6;
  readonly _type!: FromSchema<S>;

  constructor (definition: S, ajv: Ajv = new Ajv({
    coerceTypes: true
  })) {
    this.ajv = ajv;
    this.definition = definition as JSONSchema6;
    this.validate = this.ajv.compile({
      $async: true,
      ...this.definition
    });
  }
}

export function schema <S extends JSONSchema> (schema: S) {
  return new Schema(schema);
}
