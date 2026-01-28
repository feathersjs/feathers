import { setDebug } from './debug.js'
import version from './version.js'
import { Feathers } from './application.js'
import { Application } from './declarations.js'

export function feathers<T = any, S = any>() {
  return new Feathers<T, S>() as unknown as Application<T, S>
}

feathers.setDebug = setDebug

export { version, Feathers }
export { Channel } from './channel/base.js'
export { CombinedChannel } from './channel/combined.js'
export * as channelUtils from './channel/mixin.js'

export * from './hooks.js'
export * from './declarations.js'
export * from './service.js'
export * from './method.js'
export * from './debug.js'
export * from './router.js'
