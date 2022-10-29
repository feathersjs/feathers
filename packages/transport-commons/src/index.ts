import { socket } from './socket'
import { routing } from './routing'
import { channels, Channel, CombinedChannel } from './channels'
import { RealTimeConnection } from '@feathersjs/feathers'

export * as http from './http'
export { socket, routing, channels, Channel, CombinedChannel, RealTimeConnection }
