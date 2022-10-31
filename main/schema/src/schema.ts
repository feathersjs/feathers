import Ajv, {
  AsyncValidateFunction,
  ValidateFunction,
} from "https://esm.sh/ajv@8.11.0";
import {
  FromSchema,
  JSONSchema,
} from "https://deno.land/x/json_schema_to_ts@v2.5.5/index.js";
import { BadRequest } from "../../errors/mod.ts";

export const DEFAULT_AJV = new Ajv({
  coerceTypes: true,
  addUsedSchema: false,
});

export { Ajv };

/**
 * A validation function that takes data and returns the (possibly coerced)
 * data or throws a validation error.
 */
export type Validator<T = any, R = T> = (data: T) => Promise<R>;

export type JSONSchemaDefinition = JSONSchema & {
  $id: string;
  $async?: true;
  properties?: { [key: string]: JSONSchema };
  required?: readonly string[];
};

export interface Schema<T> {
  validate<X = T>(...args: Parameters<ValidateFunction<X>>): Promise<X>;
}

export class SchemaWrapper<S extends JSONSchemaDefinition>
  implements Schema<FromSchema<S>> {
  ajv: Ajv;
  validator: AsyncValidateFunction;
  readonly _type!: FromSchema<S>;

  constructor(public definition: S, ajv: Ajv = DEFAULT_AJV) {
    this.ajv = ajv;
    this.validator = this.ajv.compile({
      $async: true,
      ...(this.definition as any),
    }) as AsyncValidateFunction;
  }

  get properties() {
    return this.definition.properties as S["properties"];
  }

  get required() {
    return this.definition.required as S["required"];
  }

  async validate<T = FromSchema<S>>(...args: Parameters<ValidateFunction<T>>) {
    try {
      const validated = (await this.validator(...args)) as T;

      return validated;
    } catch (error: any) {
      throw new BadRequest(error.message, error.errors);
    }
  }

  toJSON() {
    return this.definition;
  }
}

export function schema<S extends JSONSchemaDefinition>(
  definition: S,
  ajv: Ajv = DEFAULT_AJV,
) {
  return new SchemaWrapper(definition, ajv);
}
