import Ajv, { AsyncValidateFunction, ValidateFunction } from 'ajv'
import { Static, TObject } from '@sinclair/typebox'
import { BadRequest } from '@feathersjs/errors'

export const DEFAULT_AJV = new Ajv({
  coerceTypes: true,
  addUsedSchema: false
})

export { Ajv }

export class SchemaWrapper<S extends TObject, T = Static<S>> {
  ajv: Ajv
  validator: AsyncValidateFunction
  readonly _type!: T

  constructor(public definition: S, ajv: Ajv = DEFAULT_AJV) {
    this.ajv = ajv
    this.validator = this.ajv.compile({
      $async: true,
      ...this.definition
    }) as AsyncValidateFunction
  }

  get properties() {
    return this.definition.properties
  }

  get required() {
    return this.definition.required as S['required']
  }

  async validate(...args: Parameters<ValidateFunction<T>>) {
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

export function schema<S extends TObject>(definition: S, ajv: Ajv = DEFAULT_AJV) {
  return new SchemaWrapper(definition, ajv)
}
