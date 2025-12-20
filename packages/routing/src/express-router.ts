import { BaseRouter, RouterOptions } from './base-router.js'

/**
 * Express-compatible router implementation
 *
 * Uses the same path-to-regexp library that Express Router uses internally,
 * providing 100% compatibility with Express routing patterns.
 *
 * Supports all Express routing features:
 * - Named parameters: /users/:id
 * - Wildcards: /docs/*path
 * - Optional parameters: /users/:id?
 * - Regex constraints: /users/:id(\\d+)
 * - Repeating parameters: /files/:path+
 * - Case sensitivity control
 *
 * Defaults to case insensitive routing (Express behavior)
 */
export class ExpressRouter<T = any> extends BaseRouter<T> {
  constructor(options: Partial<RouterOptions> = {}) {
    super({
      caseSensitive: options.caseSensitive ?? false, // Express default
      trailing: options.trailing ?? false // Express default
    })
  }
}
