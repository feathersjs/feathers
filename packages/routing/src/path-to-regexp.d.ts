// Type definitions for path-to-regexp v8
declare module 'path-to-regexp' {
  export interface Key {
    name: string
    type: 'param' | 'wildcard' | 'group'
  }

  export type Keys = Key[]

  export interface PathToRegexpOptions {
    sensitive?: boolean
    trailing?: boolean
    end?: boolean
    delimiter?: string
  }

  export function pathToRegexp(
    path: string,
    options?: PathToRegexpOptions
  ): { regexp: RegExp; keys: Keys }
}