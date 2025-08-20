import { createDebug } from '../debug.js'
import type { ServiceOptions, HookContext, Application } from '../declarations.js'
import { Channel } from './base.js'
import { CombinedChannel } from './combined.js'

const debug = createDebug('@feathersjs/transport-commons/channels')

const CHANNELS = Symbol.for('@feathersjs/transport-commons/channels')
const PUBLISHERS = Symbol.for('@feathersjs/transport-commons/publishers')
const ALL_EVENTS = Symbol.for('@feathersjs/transport-commons/all-events')

function flattenDeep<T>(arr: Array<T | T[]>): T[] {
  return arr.reduce((flat: T[], toFlatten: T | T[]) => {
    return flat.concat(Array.isArray(toFlatten) ? flattenDeep(toFlatten) : toFlatten)
  }, [])
}

export type Event = string | typeof ALL_EVENTS

export type Publisher<T = any, A = Application, S = any> = (
  data: T,
  context: HookContext<A, S>
) => Channel | Channel[] | void | Promise<Channel | Channel[] | void>

export function channelServiceMixin(app: Application) {
  return (service: any, path: string, serviceOptions: ServiceOptions) => {
    const { serviceEvents } = serviceOptions

    if (typeof service.publish === 'function') {
      return
    }

    // Add publish methods to service
    service[PUBLISHERS] = {}
    service.publish = function (event: Event | Publisher, publisher?: Publisher) {
      return (service as any).registerPublisher(event, publisher)
    }
    service.registerPublisher = function (event: Event | Publisher, publisher?: Publisher) {
      debug('Registering service publisher', event)

      if (!publisher && typeof event === 'function') {
        publisher = event
        event = ALL_EVENTS
      }

      if (event !== ALL_EVENTS && !serviceEvents!.includes(event as string)) {
        throw new Error(`'${event.toString()}' is not a valid service event`)
      }

      const publishers = (service as any)[PUBLISHERS]
      publishers[event as string] = publisher!

      return service
    }

    serviceEvents!.forEach((event: string) => {
      service.on(event, (data: unknown, hook: HookContext) => {
        if (!hook) {
          hook = { path, service, app, result: data } as HookContext
        }

        debug('Publishing event', event, hook.path)

        const logError = (error: any) => debug(`Error in '${hook.path} ${event}' publisher`, error)
        const servicePublishers = (service as any)[PUBLISHERS]
        const appPublishers = (app as any)[PUBLISHERS]

        const publisher =
          servicePublishers[event] ||
          servicePublishers[ALL_EVENTS] ||
          appPublishers[event] ||
          appPublishers[ALL_EVENTS] ||
          (() => {})

        try {
          Promise.resolve(publisher(data, hook))
            .then((result: any) => {
              if (!result) {
                return
              }

              const results = Array.isArray(result)
                ? flattenDeep(result).filter(Boolean)
                : ([result] as Channel[])
              const channel = new CombinedChannel(results)

              if (channel && channel.length > 0) {
                app.emit('publish', event, channel, hook, data)
              } else {
                debug('No connections to publish to')
              }
            })
            .catch(logError)
        } catch (error: any) {
          logError(error)
        }
      })
    })
  }
}

export { PUBLISHERS, ALL_EVENTS, CHANNELS }
