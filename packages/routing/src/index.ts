// Export both Express and Koa compatible routers
export { ExpressRouter } from './express-router.js'
export { KoaRouter } from './koa-router.js'
export type { RouterOptions } from './base-router.js'

// Re-export router interfaces from feathers for convenience
export type { RouterInterface, LookupResult } from 'feathers'
