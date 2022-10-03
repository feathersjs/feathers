import Ajv, { AsyncValidateFunction, ValidateFunction } from 'ajv'
import { FromSchema, JSONSchema } from 'json-schema-to-ts'
import { BadRequest } from '@feathersjs/errors'

export const DEFAULT_AJV = new Ajv({
  coerceTypes: true,
  addUsedSchema: false
})

export { Ajv }

export type JSONSchemaDefinition = JSONSchema & {
  $id: string
  $async?: true
  properties?: { [key: string]: JSONSchema }
  required?: readonly string[]
}

export type Validator<T = any, R = T> = (data: T) => Promise<R>

export type DataSchemaMap = {
  create: JSONSchemaDefinition
  update?: JSONSchemaDefinition
  patch?: JSONSchemaDefinition
}

export type DataValidatorMap = {
  create: Validator
  update: Validator
  patch: Validator
}

/**
 * Returns a compiled validation function for a schema and AJV validator instance
 *
 * @param schema The JSON schema definition
 * @param validator The AJV validation instance
 * @returns A compiled validation function
 */
export const getValidator = <T = any, R = T>(schema: JSONSchemaDefinition, validator: Ajv): Validator<T, R> =>
  validator.compile({
    $async: true,
    ...(schema as any)
  }) as any as Validator<T, R>

export const getDataValidator = (
  def: JSONSchemaDefinition | DataSchemaMap,
  validator: Ajv
): DataValidatorMap => {
  const schema = ((def as any).create ? def : { create: def }) as DataSchemaMap

  return {
    create: getValidator(schema.create, validator),
    update: getValidator(schema.update || schema.create, validator),
    patch: getValidator(
      schema.patch || {
        ...(schema.create as any),
        required: []
      },
      validator
    )
  }
}

export interface Schema<T> {
  validate<X = T>(...args: Parameters<ValidateFunction<X>>): Promise<X>
}

export class SchemaWrapper<S extends JSONSchemaDefinition> implements Schema<FromSchema<S>> {
  ajv: Ajv
  validator: AsyncValidateFunction
  readonly _type!: FromSchema<S>

  constructor(public definition: S, ajv: Ajv = DEFAULT_AJV) {
    this.ajv = ajv
    this.validator = this.ajv.compile({
      $async: true,
      ...(this.definition as any)
    }) as AsyncValidateFunction
  }

  get properties() {
    return this.definition.properties as S['properties']
  }

  get required() {
    return this.definition.required as S['required']
  }

  async validate<T = FromSchema<S>>(...args: Parameters<ValidateFunction<T>>) {
    try {
      const validated = (await this.validator(...args)) as T

      return validated
    } catch (error: any) {
      throw new BadRequest(error.message, error.errors)
    }
  }

  toJSON() {
    return this.definition
  }
}

export function schema<S extends JSONSchemaDefinition>(definition: S, ajv: Ajv = DEFAULT_AJV) {
  return new SchemaWrapper(definition, ajv)
}
