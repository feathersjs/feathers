// Type definitions for path-to-regexp v8
declare module 'path-to-regexp' {
  export interface Key {
    name: string | number
    type: 'param' | 'wildcard' | 'group'
  }

  export interface PathToRegexpOptions {
    sensitive?: boolean
    end?: boolean
    start?: boolean
    delimiter?: string
    endsWith?: string
    trailing?: boolean
  }

  export function pathToRegexp(
    path: string,
    options?: PathToRegexpOptions
  ): {
    regexp: RegExp
    keys: Key[]
  }
}
