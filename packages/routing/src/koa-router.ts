import { BaseRouter, RouterOptions } from './base-router.js'

/**
 * Koa-compatible router implementation
 *
 * Uses the same path-to-regexp library that @koa/router uses internally,
 * providing 100% compatibility with Koa routing patterns.
 *
 * Supports all Koa routing features:
 * - Named parameters: /users/:id
 * - Wildcards: /docs/*path
 * - Optional parameters: /users/:id?
 * - Regex constraints: /users/:id(\\d+)
 * - Repeating parameters: /files/:path+
 * - Case sensitivity control
 *
 * Defaults to case sensitive routing (Koa behavior)
 */
export class KoaRouter<T = any> extends BaseRouter<T> {
  constructor(options: Partial<RouterOptions> = {}) {
    super({
      caseSensitive: options.caseSensitive ?? true, // Koa default
      trailing: options.trailing ?? true // Koa default
    })
  }
}
