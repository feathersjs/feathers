import { EventEmitter } from 'events'
import { HOOKS, hooks, middleware } from './hooks/index.js'

import { stripSlashes } from './commons.js'
import { createDebug } from './debug.js'

import version from './version.js'
import { eventHook, eventMixin } from './events.js'
import { hookMixin } from './hooks.js'
import { wrapService, getServiceOptions, protectedMethods, defaultServiceEvents } from './service.js'
import type {
  FeathersApplication,
  ServiceMixin,
  Service,
  ServiceOptions,
  ServiceInterface,
  Application,
  FeathersService,
  ApplicationHookOptions
} from './declarations.js'
import { enableHooks } from './hooks.js'
import { Router } from './router.js'
import { Channel } from './channel/base.js'
import { CombinedChannel } from './channel/combined.js'
import { channelServiceMixin, Event, Publisher, PUBLISHERS, ALL_EVENTS, CHANNELS } from './channel/mixin.js'

const debug = createDebug('@feathersjs/feathers')
const channelDebug = createDebug('@feathersjs/transport-commons/channels')

export class Feathers<Services, Settings>
  extends EventEmitter
  implements FeathersApplication<Services, Settings>
{
  services: Services = {} as Services
  settings: Settings = {} as Settings
  mixins: ServiceMixin<Application<Services, Settings>>[] = [hookMixin, eventMixin]
  version: string = version
  routes: Router = new Router()
  _isSetup = false

  protected registerHooks: (this: any, allHooks: any) => any

  // Channel-related properties
  public [CHANNELS]: { [key: string]: Channel } = {}
  public [PUBLISHERS]: { [ALL_EVENTS]?: Publisher; [key: string]: Publisher } = {}

  constructor() {
    super()
    this.registerHooks = enableHooks(this)
    this.registerHooks({
      around: [eventHook]
    })
  }

  get channels(): string[] {
    return Object.keys(this[CHANNELS])
  }

  channel(...names: string[]): Channel {
    channelDebug('Returning channels', names)

    if (names.length === 0) {
      throw new Error('app.channel needs at least one channel name')
    }

    if (names.length === 1) {
      const [name] = names

      if (Array.isArray(name)) {
        return this.channel(...name)
      }

      if (!this[CHANNELS][name]) {
        const channel = new Channel()

        channel.once('empty', () => {
          channel.removeAllListeners()
          delete this[CHANNELS][name]
        })

        this[CHANNELS][name] = channel
      }

      return this[CHANNELS][name]
    }

    const channels = names.map((name) => this.channel(name))

    return new CombinedChannel(channels)
  }

  publish(event: Event | Publisher, publisher?: Publisher): this {
    return this.registerPublisher(event, publisher)
  }

  registerPublisher(event: Event | Publisher, publisher?: Publisher): this {
    channelDebug('Registering publisher', event)

    if (!publisher && typeof event === 'function') {
      publisher = event
      event = ALL_EVENTS
    }

    const { serviceEvents = defaultServiceEvents } = getServiceOptions(this) || {}

    if (event !== ALL_EVENTS && !serviceEvents.includes(event as string)) {
      throw new Error(`'${event.toString()}' is not a valid service event`)
    }

    const publishers = this[PUBLISHERS]
    publishers[event as string] = publisher!

    return this
  }

  get<L extends keyof Settings & string>(name: L): Settings[L] {
    return this.settings[name]
  }

  set<L extends keyof Settings & string>(name: L, value: Settings[L]) {
    this.settings[name] = value
    return this
  }

  configure(callback: (this: this, app: this) => void) {
    callback.call(this, this)

    return this
  }

  defaultService(location: string): ServiceInterface {
    throw new Error(`Can not find service '${location}'`)
  }

  service<L extends keyof Services & string>(
    location: L
  ): FeathersService<this, keyof any extends keyof Services ? Service : Services[L]> {
    const path = (stripSlashes(location) || '/') as L
    const current = this.services.hasOwnProperty(path) ? this.services[path] : undefined

    if (typeof current === 'undefined') {
      this.use(path, this.defaultService(path) as any)
      return this.service(path)
    }

    return current as any
  }

  lookup(path: string) {
    const result = this.routes.lookup(path)

    if (result === null) {
      return null
    }

    const {
      params: colonParams,
      data: { service, params: dataParams }
    } = result

    const params = dataParams ? { ...dataParams, ...colonParams } : colonParams

    return { service, params }
  }

  protected _setup() {
    this._isSetup = true

    return Object.keys(this.services)
      .reduce(
        (current, path) =>
          current.then(() => {
            const service: any = this.service(path as any)

            if (typeof service.setup === 'function') {
              debug(`Setting up service for \`${path}\``)

              return service.setup(this, path)
            }
          }),
        Promise.resolve()
      )
      .then(() => this)
  }

  get setup() {
    return this._setup
  }

  set setup(value) {
    this._setup = (value as any)[HOOKS]
      ? value
      : hooks(
          value,
          middleware().params('server').props({
            app: this
          })
        )
  }

  protected _teardown() {
    this._isSetup = false

    return Object.keys(this.services)
      .reduce(
        (current, path) =>
          current.then(() => {
            const service: any = this.service(path as any)

            if (typeof service.teardown === 'function') {
              debug(`Tearing down service for \`${path}\``)

              return service.teardown(this, path)
            }
          }),
        Promise.resolve()
      )
      .then(() => this)
  }

  get teardown() {
    return this._teardown
  }

  set teardown(value) {
    this._teardown = (value as any)[HOOKS]
      ? value
      : hooks(
          value,
          middleware().params('server').props({
            app: this
          })
        )
  }

  use<L extends keyof Services & string>(
    path: L,
    service: keyof any extends keyof Services ? ServiceInterface | Application : Services[L],
    options?: ServiceOptions<keyof any extends keyof Services ? string : keyof Services[L]>
  ): this {
    if (typeof path !== 'string') {
      throw new Error(`'${path}' is not a valid service path.`)
    }

    const location = (stripSlashes(path) || '/') as L
    const subApp = service as Application
    const isSubApp = typeof subApp.service === 'function' && subApp.services

    if (isSubApp) {
      Object.keys(subApp.services).forEach((subPath) =>
        this.use(`${location}/${subPath}` as any, subApp.service(subPath) as any)
      )

      return this
    }

    const protoService = wrapService(location, service, options as ServiceOptions)
    const serviceOptions = getServiceOptions(protoService)
    const routerParams = {
      service: protoService,
      params: serviceOptions.routeParams || {}
    }

    for (const name of protectedMethods) {
      if (serviceOptions.methods.includes(name)) {
        throw new Error(`'${name}' on service '${location}' is not allowed as a custom method name`)
      }
    }

    debug(`Registering new service at \`${location}\``)

    // Add all the mixins
    this.mixins.forEach((fn) => fn.call(this, protoService, location, serviceOptions))

    // Add channel publishing functionality to the service
    channelServiceMixin(this as any)(protoService, location, serviceOptions)

    this.routes.insert(path, routerParams)
    this.routes.insert(`${path}/:__id`, routerParams)
    this.services[location] = protoService

    // If we ran setup already, set this service up explicitly, this will not `await`
    if (this._isSetup && typeof protoService.setup === 'function') {
      debug(`Setting up service for \`${location}\``)
      protoService.setup(this, location)
    }

    return this
  }

  async unuse<L extends keyof Services & string>(
    location: L
  ): Promise<FeathersService<this, keyof any extends keyof Services ? Service : Services[L]>> {
    const path = (stripSlashes(location) || '/') as L
    const service = this.services[path] as Service

    if (service && typeof service.teardown === 'function') {
      await service.teardown(this as any, path)
    }

    delete this.services[path]

    this.routes.remove(path)
    this.routes.remove(`${path}/:__id`)

    return service as any
  }

  hooks(hookMap: ApplicationHookOptions<this>) {
    const untypedMap = hookMap as any

    if (untypedMap.before || untypedMap.after || untypedMap.error || untypedMap.around) {
      // regular hooks for all service methods
      this.registerHooks(untypedMap)
    } else if (untypedMap.setup || untypedMap.teardown) {
      // .setup and .teardown application hooks
      hooks(this, untypedMap)
    } else {
      // Other registration formats are just `around` hooks
      this.registerHooks({
        around: untypedMap
      })
    }

    return this
  }
}
