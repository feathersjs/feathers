import Ajv, { AsyncValidateFunction } from 'ajv';
import { JSONSchema6 } from 'json-schema';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

export const AJV = new Ajv({
  coerceTypes: true
});

export type JSONSchemaDefinition = JSONSchema & { $id: string };

export class Schema<S extends JSONSchemaDefinition> {
  ajv: Ajv;
  validate: AsyncValidateFunction<FromSchema<S>>;
  definition: JSONSchema6;
  propertyNames: string[];
  readonly _type!: FromSchema<S>;

  constructor (definition: S, ajv: Ajv = AJV) {
    this.ajv = ajv;
    this.definition = definition as JSONSchema6;
    this.propertyNames = Object.keys(this.definition.properties)
    this.validate = this.ajv.compile({
      $async: true,
      ...this.definition
    });
  }

  extend <D extends JSONSchemaDefinition> (definition: D) {
    const def = definition as JSONSchema6;
    const extended = {
      ...this.definition,
      ...def,
      properties: {
        ...this.definition.properties,
        ...def.properties
      }
    } as const;

    return new Schema <D & S> (extended as any, this.ajv);
  }

  toJSON () {
    return this.definition;
  }
}

export function schema <S extends JSONSchemaDefinition> (definition: S, ajv: Ajv = AJV) {
  return new Schema(definition, ajv);
}
