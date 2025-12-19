import { pathToRegexp, Key } from 'path-to-regexp'
import { RouterInterface, LookupResult } from 'feathers'
import { stripSlashes } from 'feathers/commons'

function normalizePath(path: string): string {
  if (!path || path === '/') {
    return ''
  }
  return stripSlashes(path)
}

export interface RouterOptions {
  caseSensitive?: boolean
  trailing?: boolean
}

export abstract class BaseRouter<T = any> implements RouterInterface<T> {
  public caseSensitive: boolean

  private routes: Array<{
    regexp: RegExp
    keys: Key[]
    data: T
    originalPath: string
  }> = []

  private pathSet: Set<string> = new Set()
  private options: RouterOptions

  constructor(options: RouterOptions) {
    this.caseSensitive = options.caseSensitive ?? true
    this.options = options
  }

  lookup(path: string): LookupResult<T> | null {
    if (typeof path !== 'string') {
      return null
    }

    const normalizedPath = normalizePath(path)

    for (const route of this.routes) {
      const match = route.regexp.exec(normalizedPath)

      if (match) {
        const params: { [key: string]: string | string[] } = Object.create(null)

        for (let i = 0; i < route.keys.length; i++) {
          const key = route.keys[i]
          const value = match[i + 1]

          if (value !== undefined) {
            if (key.type === 'wildcard' || String(key.name).startsWith('*')) {
              const paramName = String(key.name).replace(/^\*/, '') || '*'
              params[paramName] = value ? value.split('/').filter(Boolean) : []
            } else {
              params[key.name] = value
            }
          }
        }

        return {
          data: route.data,
          params
        }
      }
    }

    return null
  }

  insert(path: string, data: T): void {
    const normalizedPath = normalizePath(path)

    if (this.pathSet.has(normalizedPath)) {
      throw new Error(`Path ${normalizedPath} already exists`)
    }

    const { regexp, keys } = pathToRegexp(normalizedPath, {
      sensitive: this.caseSensitive,
      end: true,
      trailing: this.options.trailing,
      start: true
    })

    this.pathSet.add(normalizedPath)
    this.routes.push({
      regexp,
      keys,
      data,
      originalPath: normalizedPath
    })
  }

  remove(path: string): void {
    const normalizedPath = normalizePath(path)
    const index = this.routes.findIndex((route) => route.originalPath === normalizedPath)

    if (index !== -1) {
      this.pathSet.delete(normalizedPath)
      this.routes.splice(index, 1)
    }
  }
}
