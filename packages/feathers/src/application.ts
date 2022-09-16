import version from './version'
import { EventEmitter } from 'events'
import { stripSlashes, createDebug } from '@feathersjs/commons'
import { hooks, middleware } from '@feathersjs/hooks'
import { eventHook, eventMixin } from './events'
import { hookMixin } from './hooks'
import { wrapService, getServiceOptions, protectedMethods } from './service'
import {
  FeathersApplication,
  ServiceMixin,
  Service,
  ServiceOptions,
  ServiceInterface,
  Application,
  FeathersService,
  ApplicationHookOptions
} from './declarations'
import { enableHooks } from './hooks'

const debug = createDebug('@feathersjs/feathers')

export class Feathers<Services, Settings>
  extends EventEmitter
  implements FeathersApplication<Services, Settings>
{
  services: Services = {} as Services
  settings: Settings = {} as Settings
  mixins: ServiceMixin<Application<Services, Settings>>[] = [hookMixin, eventMixin]
  version: string = version
  _isSetup = false

  protected registerHooks: (this: any, allHooks: any) => any

  constructor() {
    super()
    hooks(this, {
      setup: middleware().params('server').props({
        app: this
      }),
      teardown: middleware().params('server').props({
        app: this
      })
    })
    this.registerHooks = enableHooks(this)
    this.registerHooks({
      around: [eventHook]
    })
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
    const current = this.services[path]

    if (typeof current === 'undefined') {
      this.use(path, this.defaultService(path) as any)
      return this.service(path)
    }

    return current as any
  }

  use<L extends keyof Services & string>(
    path: L,
    service: keyof any extends keyof Services ? ServiceInterface | Application : Services[L],
    options?: ServiceOptions
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

    const protoService = wrapService(location, service, options)
    const serviceOptions = getServiceOptions(protoService)

    for (const name of protectedMethods) {
      if (serviceOptions.methods.includes(name)) {
        throw new Error(`'${name}' on service '${location}' is not allowed as a custom method name`)
      }
    }

    debug(`Registering new service at \`${location}\``)

    // Add all the mixins
    this.mixins.forEach((fn) => fn.call(this, protoService, location, serviceOptions))

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

  setup() {
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

  teardown() {
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
}
