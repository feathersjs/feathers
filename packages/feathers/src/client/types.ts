// Utility type to pick only the `query` property from Params if it exists
type QueryParams<T> = T extends { query?: infer Q } ? { query?: Q } : never

// Infer the types of `id`, `data`, and `params` for a given method signature
type MethodParams<T, X> = T extends (...args: any[]) => any
  ? Parameters<T> extends [infer I, infer D, infer P]
    ? [I, D, Omit<X, 'query'> & QueryParams<P>] | [I, D]
    : Parameters<T> extends [infer I, infer P]
      ? [I, Omit<X, 'query'> & QueryParams<P>] | [I]
      : Parameters<T> extends [infer P]
        ? [Omit<X, 'query'> & QueryParams<P>] | []
        : never
  : never

// Infer the return type of a given method
type MethodReturnType<T> = T extends (...args: any[]) => infer R ? R : any

// Define a type that represents the methods and their inferred types
export type PublicServiceMethods<S, X> = {
  [K in keyof S]: S[K] extends (...args: any[]) => Promise<any>
    ? (...args: MethodParams<S[K], X>) => MethodReturnType<S[K]>
    : never
}

type ConditionalPick<Base, Condition> = {
  [Key in keyof Base]: Key extends Condition ? Base[Key] : never
}

type NonNeverKeys<T> = {
  [Key in keyof T]: T[Key] extends never ? never : Key
}[keyof T]

type ConditionalPublicMethods<T, Keys> = Pick<T, NonNeverKeys<ConditionalPick<T, Keys>>>

type DefaultMethodNames = 'create' | 'find' | 'get' | 'update' | 'remove' | 'patch'

export type ClientServices<ST, X> = {
  [K in keyof ST]: ConditionalPublicMethods<PublicServiceMethods<ST[K], X>, DefaultMethodNames>
}
