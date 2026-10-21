import { setDebug } from './debug.js'
import version from './version.js'
import { Feathers } from './application.js'
import type { Application } from './declarations.js'

export function feathers<T = any, S = any>() {
  return new Feathers<T, S>() as unknown as Application<T, S>
}

feathers.setDebug = setDebug

export { version, Feathers }
// The Channel class takes precedence over the Channel interface from declarations
// eslint-disable-next-line import-x/export
export { Channel } from './channel/base.js'
export { CombinedChannel } from './channel/combined.js'
export * as channelUtils from './channel/mixin.js'

export * from './hooks.js'
// eslint-disable-next-line import-x/export
export * from './declarations.js'
export * from './service.js'
export * from './debug.js'
export * from './router.js'
export * from './event-emitter.js'
