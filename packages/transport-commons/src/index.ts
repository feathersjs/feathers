import { socket } from './socket'
import { routing, RouteLookup } from './routing'
import { channels, Channel, CombinedChannel } from './channels'
import { RealTimeConnection } from '@feathersjs/feathers'

export * as http from './http'
export { socket, routing, channels, RouteLookup, Channel, CombinedChannel, RealTimeConnection }
