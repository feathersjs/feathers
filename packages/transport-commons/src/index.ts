import { socket } from './socket'
import { routing } from './routing'
import { channels, Channel, CombinedChannel } from './channels'
import { RealTimeConnection } from '@feathersjs/feathers'

// TODO: probably move this to another package so that it can be destructured (tree-shaking)
export * as http from './http'
export { socket, routing, channels, Channel, CombinedChannel, RealTimeConnection }

// TODO: probably move this to another package so that it can be destructured (tree-shaking)
export * as client from './client'
