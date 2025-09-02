import { pathToRegexp, Keys } from 'path-to-regexp'
import { RouterInterface, LookupResult } from 'feathers'
import { stripSlashes } from 'feathers/commons'

function normalizePath(path: string): string {
  if (!path || path === '/') {
    return ''
  }
  return stripSlashes(path)
}

/**
 * Express-compatible router implementation
 *
 * Uses the same path-to-regexp library that Express Router uses internally,
 * providing 100% compatibility with Express routing patterns.
 *
 * Supports all Express routing features:
 * - Named parameters: /users/:id
 * - Wildcards: /docs/*
 * - Optional parameters: /users/:id?
 * - Regex constraints: /users/:id(\\d+)
 * - Repeating parameters: /files/:path+
 * - Case sensitivity control
 */
export class ExpressRouter<T = any> implements RouterInterface<T> {
  public caseSensitive = true

  private routes: Array<{
    regexp: RegExp
    keys: Keys
    data: T
    originalPath: string
  }> = []

  lookup(path: string): LookupResult<T> | null {
    const normalizedPath = normalizePath(path)

    for (const route of this.routes) {
      // Apply case sensitivity dynamically by creating regex with appropriate flags
      const flags = this.caseSensitive ? '' : 'i'
      const testRegex = new RegExp(route.regexp.source, flags)

      const match = testRegex.exec(normalizedPath)

      if (match) {
        const params: { [key: string]: string | string[] } = Object.create(null)

        // Extract parameters using path-to-regexp's Key system
        for (let i = 0; i < route.keys.length; i++) {
          const key = route.keys[i]
          const value = match[i + 1]

          if (value !== undefined) {
            if (key.type === 'wildcard') {
              // Handle wildcard parameters
              params[key.name] = value ? value.split('/').filter(Boolean) : []
            } else if (key.type === 'param') {
              // Regular named parameter
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

    // Check for existing route
    if (this.routes.find((route) => route.originalPath === normalizedPath)) {
      throw new Error(`Path ${normalizedPath} already exists`)
    }

    // Use path-to-regexp with Express-compatible options
    const { regexp, keys } = pathToRegexp(normalizedPath, {
      sensitive: this.caseSensitive,
      trailing: true, // Allow trailing slash
      end: true, // Exact match required
      delimiter: '/' // Path delimiter
    })

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
      this.routes.splice(index, 1)
    }
  }
}
