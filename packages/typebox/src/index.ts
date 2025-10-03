import Type, {
  TObject,
  TInteger,
  TOptional,
  TSchema,
  TIntersect,
  TUnion,
  type TObjectOptions,
  type TRecord
} from 'typebox'
import type { Validator, DataValidatorMap } from '@feathersjs/schema'
import { jsonSchema, Ajv } from '@feathersjs/schema'
export * from './default-schemas.js'
export { Type, Static } from 'typebox'

export type TDataSchemaMap = {
  create: TObject
  update?: TObject
  patch?: TObject
}
// ------------------------------------------------------------------
// GetValidator: No Change
// ------------------------------------------------------------------
/**
 * Returns a compiled validation function for a TypeBox object and AJV validator instance.
 *
 * @param schema The JSON schema definition
 * @param validator The AJV validation instance
 * @returns A compiled validation function
 */
export const getValidator = <T = any, R = T>(
  schema: TObject | TIntersect | TUnion<TObject[]> | TRecord,
  validator: Ajv
): Validator<T, R> => jsonSchema.getValidator(schema as any, validator)

/**
 * Returns compiled validation functions to validate data for the `create`, `update` and `patch`
 * service methods. If not passed explicitly, the `update` validator will be the same as the `create`
 * and `patch` will be the `create` validator with no required fields.
 *
 * @param def Either general TypeBox object definition or a mapping of `create`, `update` and `patch`
 * to their respective type object
 * @param validator The Ajv instance to use as the validator
 * @returns A map of validator functions
 */
export const getDataValidator = (def: TObject | TDataSchemaMap, validator: Ajv): DataValidatorMap =>
  jsonSchema.getDataValidator(def as any, validator)

// ------------------------------------------------------------------
// StringEnum: Tip Type.Enum([]) to produce { enum: [...] } schema
// ------------------------------------------------------------------
/**
 * A TypeBox utility that converts an array of provided strings into a string enum.
 * @param allowedValues array of strings for the enum
 * @returns TypeBox.Type
 */
export function StringEnum<Values extends string[]>(
  allowedValues: [...Values],
  options?: { default: Values[number] }
) {
  return Type.Unsafe<Values[number]>({ type: 'string', enum: allowedValues, ...options })
}

// ------------------------------------------------------------------
// ArrayOfKeys: Explicit, Unsafe
// ------------------------------------------------------------------
export type TArrayOfKeys<Type extends TObject> = Type.TUnsafe<(keyof Type['properties'])[]>
const arrayOfKeys = <Type extends TObject>(type: Type): TArrayOfKeys<Type> => {
  const keys = Object.keys(type.properties)
  return Type.Unsafe<(keyof Type['properties'])[]>({
    type: 'array',
    maxItems: keys.length,
    items: {
      type: 'string',
      ...(keys.length > 0 ? { enum: keys } : {})
    }
  })
}

// ------------------------------------------------------------------
// SortDefinition: Symmetric Mapping, Return Never
// ------------------------------------------------------------------
export type TSortDefinition<
  Type extends TObject,
  Properties extends Type.TProperties = { [K in keyof Type['properties']]: TOptional<TInteger> },
  Return extends Type.TSchema = Type.TObject<Properties>
> = Return

/**
 * Creates the `$sort` Feathers query syntax schema for an object schema
 *
 * @param type The TypeBox object schema
 * @returns The `$sort` syntax schema
 */
export function sortDefinition<Type extends TObject>(type: Type): TSortDefinition<Type> {
  const properties = Object.keys(type.properties).reduce((res, key) => {
    const result = res as any
    result[key] = Type.Optional(Type.Integer({ minimum: -1, maximum: 1 }))
    return result
  }, {} as Type.TProperties)
  return Type.Object(properties, { additionalProperties: false }) as never
}

// ------------------------------------------------------------------
// QueryProperty: Symmetric Mapping, Return Never
// ------------------------------------------------------------------
export type TQueryProperty<
  Def extends TSchema,
  Extension extends Type.TProperties,
  Return extends Type.TSchema = Type.TUnion<
    [
      Def,
      Type.TPartial<
        Type.TIntersect<
          [
            Type.TObject<{
              $gt: Def
              $gte: Def
              $lt: Def
              $lte: Def
              $ne: Def
              $in: Type.TArray<Def>
              $nin: Type.TArray<Def>
            }>,
            Type.TObject<Extension>
          ]
        >
      >
    ]
  >
> = Return
/**
 * Returns the standard Feathers query syntax for a property schema,
 * including operators like `$gt`, `$lt` etc. for a single property
 *
 * @param def The property definition
 * @param extension Additional properties to add to the property query
 * @returns The Feathers query syntax schema
 */
export const queryProperty = <Def extends TSchema, Extension extends { [key: string]: TSchema }>(
  def: Def,
  extension: Extension
): TQueryProperty<Def, Extension> =>
  Type.Union([
    def,
    Type.Partial(
      Type.Intersect(
        [
          Type.Object({
            $gt: def,
            $gte: def,
            $lt: def,
            $lte: def,
            $ne: def,
            $in: Type.Array(def),
            $nin: Type.Array(def)
          }),
          Type.Object((extension || {}) as Extension)
        ],
        { additionalProperties: false }
      )
    )
  ]) as any

// ------------------------------------------------------------------
// QueryProperties: Symmetric Mapping, Return Never
// ------------------------------------------------------------------
type TQueryProperties<
  // Parameters
  Type extends TObject,
  Extensions extends { [K in keyof Type['properties']]?: { [key: string]: TSchema } },
  // Variables + Return
  Properties extends Type.TProperties = {
    [K in keyof Type['properties']]: TQueryProperty<Type['properties'][K], NonNullable<Extensions[K]>>
  },
  Return extends Type.TSchema = Type.TOptional<Type.TObject<Properties>>
> = Return
/**
 * Creates a Feathers query syntax schema for the properties defined in `definition`.
 *
 * @param definition The properties to create the Feathers query syntax schema for
 * @param extensions Additional properties to add to a property query
 * @returns The Feathers query syntax schema
 */
export const queryProperties = <
  Type extends TObject,
  Extensions extends { [K in keyof Type['properties']]?: { [key: string]: TSchema } }
>(
  definition: Type,
  extensions: Extensions
): TQueryProperties<Type, Extensions> => {
  const properties = Object.keys(definition.properties).reduce((res, key) => {
    const result = res as any
    const value = definition.properties[key]

    result[key] = queryProperty(value, extensions[key] || {})

    return result
  }, {})
  return Type.Optional(Type.Object(properties, { additionalProperties: false })) as never
}
// ------------------------------------------------------------------
// QuerySyntax: Symmetric Mapping, Return Never
// ------------------------------------------------------------------
export type TQuerySyntax<
  // Parameters
  Type extends TObject,
  Extensions extends { [K in keyof Type['properties']]?: { [key: string]: TSchema } },
  // Variables + Return
  PropertySchema extends Type.TObject = TQueryProperties<Type, Extensions>,
  Or extends TSchema = Type.TArray<PropertySchema>,
  And extends TSchema = Type.TArray<Type.TUnion<[PropertySchema, Or]>>,
  Return extends TSchema = Type.TPartial<
    Type.TObject<
      {
        $limit: Type.TNumber
        $skip: Type.TNumber
        $sort: TSortDefinition<Type>
        $select: TArrayOfKeys<Type>
        $or: Or
        $and: And
      } & PropertySchema['properties']
    > // todo: consider Simplify<T> to flatten intersection
  >
> = Return

/**
 * Creates a TypeBox schema for the complete Feathers query syntax including `$limit`, $skip`, `$or`
 * and `$sort` and `$select` for the allowed properties.
 *
 * @param type The properties to create the query syntax for
 * @param extensions Additional properties to add to the query syntax, use `{}` if none
 * @param options Options for the TypeBox object schema
 * @returns A TypeBox object representing the complete Feathers query syntax for the given properties
 */
export const querySyntax = <
  Type extends TObject,
  Extensions extends { [K in keyof Type['properties']]?: { [key: string]: TSchema } }
>(
  type: Type,
  extensions: Extensions,
  options: TObjectOptions = { additionalProperties: false }
): TQuerySyntax<Type, Extensions> => {
  const propertySchema = queryProperties(type, extensions)
  const $or = Type.Array(propertySchema)
  const $and = Type.Array(Type.Union([propertySchema, Type.Object({ $or })]))
  return Type.Partial(
    Type.Object(
      {
        $limit: Type.Number({ minimum: 0 }),
        $skip: Type.Number({ minimum: 0 }),
        $sort: sortDefinition(type),
        $select: arrayOfKeys(type),
        $and,
        $or,
        ...propertySchema.properties
      },
      { additionalProperties: false }
    ),
    options
  ) as never
}
// ------------------------------------------------------------------
// ObjectSchemaId: Explicit Return
// ------------------------------------------------------------------
export type TObjectIdSchema = Type.TUnion<[Type.TString, Type.TObject<Type.TProperties>]>
export const ObjectIdSchema = (): TObjectIdSchema =>
  Type.Union([Type.String({ objectid: true }), Type.Object({}, { additionalProperties: true })])
