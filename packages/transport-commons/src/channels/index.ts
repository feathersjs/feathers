import { Application, FeathersService, RealTimeConnection, getServiceOptions } from '@feathersjs/feathers'
import { createDebug } from '@feathersjs/commons'
import { compact, flattenDeep, noop } from 'lodash'
import { Channel } from './channel/base'
import { CombinedChannel } from './channel/combined'
import { channelMixin, publishMixin, keys, PublishMixin, Event, Publisher } from './mixins'
import EventEmitter from 'events'

const debug = createDebug('@feathersjs/transport-commons/channels')
const { CHANNELS } = keys

declare module '@feathersjs/feathers/lib/declarations' {
  interface ServiceAddons<A, S> extends EventEmitter {
    // eslint-disable-line
    publish(publisher: Publisher<ServiceGenericType<S>, A, this>): this
    publish(event: Event, publisher: Publisher<ServiceGenericType<S>, A, this>): this

    registerPublisher(publisher: Publisher<ServiceGenericType<S>, A, this>): this
    registerPublisher(event: Event, publisher: Publisher<ServiceGenericType<S>, A, this>): this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Application<Services, Settings> {
    // eslint-disable-line
    channels: string[]

    channel(name: string | string[]): Channel
    channel(...names: string[]): Channel

    publish<T>(publisher: Publisher<T, this>): this
    publish<T>(event: Event, publisher: Publisher<T, this>): this

    registerPublisher<T>(publisher: Publisher<T, this>): this
    registerPublisher<T>(event: Event, publisher: Publisher<T, this>): this
  }

  interface Params {
    connection?: RealTimeConnection
  }
}

export { keys }

export function channels() {
  return (app: Application) => {
    if (typeof app.channel === 'function' && typeof app.publish === 'function') {
      return
    }

    Object.assign(app, channelMixin(), publishMixin())
    Object.defineProperty(app, 'channels', {
      get() {
        return Object.keys(this[CHANNELS])
      }
    })

    app.mixins.push((service: FeathersService, path: string) => {
      const { serviceEvents } = getServiceOptions(service)

      if (typeof service.publish === 'function') {
        return
      }

      Object.assign(service, publishMixin())

      serviceEvents.forEach((event: string) => {
        service.on(event, function (data, hook) {
          if (!hook) {
            // Fake hook for custom events
            hook = { path, service, app, result: data }
          }

          debug('Publishing event', event, hook.path)

          const logError = (error: any) => debug(`Error in '${hook.path} ${event}' publisher`, error)
          const servicePublishers = (service as unknown as PublishMixin)[keys.PUBLISHERS]
          const appPublishers = (app as unknown as PublishMixin)[keys.PUBLISHERS]
          // This will return the first publisher list that is not empty
          // In the following precedence
          const publisher =
            // 1. Service publisher for a specific event
            servicePublishers[event] ||
            // 2. Service publisher for all events
            servicePublishers[keys.ALL_EVENTS] ||
            // 3. App publisher for a specific event
            appPublishers[event] ||
            // 4. App publisher for all events
            appPublishers[keys.ALL_EVENTS] ||
            // 5. No publisher
            noop

          try {
            Promise.resolve(publisher(data, hook))
              .then((result: any) => {
                if (!result) {
                  return
                }

                const results = Array.isArray(result) ? compact(flattenDeep(result)) : ([result] as Channel[])
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
    })
  }
}

export { Channel, CombinedChannel, RealTimeConnection }
