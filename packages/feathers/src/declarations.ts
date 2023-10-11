import { EventEmitter } from 'events'
import { NextFunction, HookContext as BaseHookContext } from '@feathersjs/hooks'

type SelfOrArray<S> = S | S[]
type OptionalPick<T, K extends PropertyKey> = Pick<T, Extract<keyof T, K>>
type Entries<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T][]
type GetKeyByValue<Obj, Value> = Extract<Entries<Obj>[number], [PropertyKey, Value]>[0]

export type { NextFunction }

/**
 * The object returned from `.find` call by standard database adapters
 */
export interface Paginated<T> {
  total: number
  limit: number
  skip: number
  data: T[]
}

/**
 * Options that can be passed when registering a service via `app.use(name, service, options)`
 */
export interface ServiceOptions<MethodTypes = string> {
  /**
   * A list of custom events that this service emits to clients
   */
  events?: string[] | readonly string[]
  /**
   * A list of service methods that should be available __externally__ to clients
   */
  methods?: MethodTypes[] | readonly MethodTypes[]
  /**
   * Provide a full list of events that this service should emit to clients.
   * Unlike the `events` option, this will not be merged with the default events.
   */
  serviceEvents?: string[] | readonly string[]
  /**
   * Initial data to always add as route params to this service.
   */
  routeParams?: { [key: string]: any }
}

export interface ClientService<
  Result = any,
  Data = Partial<Result>,
  PatchData = Data,
  FindResult = Paginated<Result>,
  P = Params
> {
  find(params?: P): Promise<FindResult>

  get(id: Id, params?: P): Promise<Result>

  create(data: Data[], params?: P): Promise<Result[]>
  create(data: Data, params?: P): Promise<Result>

  update(id: Id, data: Data, params?: P): Promise<Result>
  update(id: NullableId, data: Data, params?: P): Promise<Result | Result[]>
  update(id: null, data: Data, params?: P): Promise<Result[]>

  patch(id: NullableId, data: PatchData, params?: P): Promise<Result | Result[]>
  patch(id: Id, data: PatchData, params?: P): Promise<Result>
  patch(id: null, data: PatchData, params?: P): Promise<Result[]>

  remove(id: NullableId, params?: P): Promise<Result | Result[]>
  remove(id: Id, params?: P): Promise<Result>
  remove(id: null, params?: P): Promise<Result[]>
}

export interface ServiceMethods<
  Result = any,
  Data = Partial<Result>,
  ServiceParams = Params,
  PatchData = Partial<Data>
> {
  find(params?: ServiceParams & { paginate?: PaginationParams }): Promise<Result | Result[]>

  get(id: Id, params?: ServiceParams): Promise<Result>

  create(data: Data, params?: ServiceParams): Promise<Result>

  update(id: NullableId, data: Data, params?: ServiceParams): Promise<Result | Result[]>

  patch(id: NullableId, data: PatchData, params?: ServiceParams): Promise<Result | Result[]>

  remove(id: NullableId, params?: ServiceParams): Promise<Result | Result[]>

  setup?(app: Application, path: string): Promise<void>

  teardown?(app: Application, path: string): Promise<void>
}

export interface ServiceOverloads<
  Result = any,
  Data = Partial<Result>,
  ServiceParams = Params,
  PatchData = Partial<Data>
> {
  create?(data: Data[], params?: ServiceParams): Promise<Result[]>

  update?(id: Id, data: Data, params?: ServiceParams): Promise<Result>

  update?(id: null, data: Data, params?: ServiceParams): Promise<Result[]>

  patch?(id: Id, data: PatchData, params?: ServiceParams): Promise<Result>

  patch?(id: null, data: PatchData, params?: ServiceParams): Promise<Result[]>

  remove?(id: Id, params?: ServiceParams): Promise<Result>

  remove?(id: null, params?: ServiceParams): Promise<Result[]>
}

/**
 * A complete service interface. The `ServiceInterface` type should be preferred for customs service
 * implementations
 */
export type Service<
  Result = any,
  Data = Partial<Result>,
  ServiceParams = Params,
  PatchData = Partial<Data>
> = ServiceMethods<Result, Data, ServiceParams> & ServiceOverloads<Result, Data, ServiceParams, PatchData>

/**
 * The `Service` service interface but with none of the methods required.
 */
export type ServiceInterface<
  Result = any,
  Data = Partial<Result>,
  ServiceParams = Params,
  PatchData = Partial<Data>
> = Partial<ServiceMethods<Result, Data, ServiceParams, PatchData>>

export interface ServiceAddons<A = Application, S = Service> extends EventEmitter {
  id?: string
  hooks(options: HookOptions<A, S>): this
}

export interface ServiceHookOverloads<S, P = Params> {
  find(params: P & { paginate?: PaginationParams }, context: HookContext): Promise<HookContext>

  get(id: Id, params: P, context: HookContext): Promise<HookContext>

  create(
    data: ServiceGenericData<S> | ServiceGenericData<S>[],
    params: P,
    context: HookContext
  ): Promise<HookContext>

  update(id: NullableId, data: ServiceGenericData<S>, params: P, context: HookContext): Promise<HookContext>

  patch(id: NullableId, data: ServiceGenericData<S>, params: P, context: HookContext): Promise<HookContext>

  remove(id: NullableId, params: P, context: HookContext): Promise<HookContext>
}

export type FeathersService<A = FeathersApplication, S = Service> = S &
  ServiceAddons<A, S> &
  OptionalPick<ServiceHookOverloads<S>, keyof S>

export type CustomMethods<T extends { [key: string]: [any, any] }> = {
  [K in keyof T]: (data: T[K][0], params?: Params) => Promise<T[K][1]>
}

/**
 * An interface usually use by transport clients that represents a e.g. HTTP or websocket
 * connection that can be configured on the application.
 */
export type TransportConnection<Services = any> = {
  (app: Application<Services>): void
  Service: any
  service: <L extends keyof Services & string>(
    name: L
  ) => keyof any extends keyof Services ? ServiceInterface : Services[L]
}

/**
 * A real-time connection object
 */
export interface RealTimeConnection {
  [key: string]: any
}

/**
 * The interface for a custom service method. Can e.g. be used to type client side services.
 */
export type CustomMethod<T = any, R = T, P extends Params = Params> = (data: T, params?: P) => Promise<R>

export type ServiceMixin<A> = (service: FeathersService<A>, path: string, options: ServiceOptions) => void

export type ServiceGenericType<S> = S extends ServiceInterface<infer T> ? T : any
export type ServiceGenericData<S> = S extends ServiceInterface<infer _T, infer D> ? D : any
export type ServiceGenericParams<S> = S extends ServiceInterface<infer _T, infer _D, infer P> ? P : any

export interface FeathersApplication<Services = any, Settings = any> {
  /**
   * The Feathers application version
   */
  version: string

  /**
   * A list of callbacks that run when a new service is registered
   */
  mixins: ServiceMixin<Application<Services, Settings>>[]

  /**
   * The index of all services keyed by their path.
   *
   * __Important:__ Services should always be retrieved via `app.service('name')`
   * not via `app.services`.
   */
  services: Services

  /**
   * The application settings that can be used via
   * `app.get` and `app.set`
   */
  settings: Settings

  /**
   * A private-ish indicator if `app.setup()` has been called already
   */
  _isSetup: boolean

  /**
   * Retrieve an application setting by name
   *
   * @param name The setting name
   */
  get<L extends keyof Settings & string>(name: L): Settings[L]

  /**
   * Set an application setting
   *
   * @param name The setting name
   * @param value The setting value
   */
  set<L extends keyof Settings & string>(name: L, value: Settings[L]): this

  /**
   * Runs a callback configure function with the current application instance.
   *
   * @param callback The callback `(app: Application) => {}` to run
   */
  configure(callback: (this: this, app: this) => void): this

  /**
   * Returns a fallback service instance that will be registered
   * when no service was found. Usually throws a `NotFound` error
   * but also used to instantiate client side services.
   *
   * @param location The path of the service
   */
  defaultService(location: string): ServiceInterface

  /**
   * Register a new service or a sub-app. When passed another
   * Feathers application, all its services will be re-registered
   * with the `path` prefix.
   *
   * @param path The path for the service to register
   * @param service The service object to register or another
   * Feathers application to use a sub-app under the `path` prefix.
   * @param options The options for this service
   */
  use<L extends keyof Services & string>(
    path: L,
    service: keyof any extends keyof Services ? ServiceInterface | Application : Services[L],
    options?: ServiceOptions<keyof any extends keyof Services ? string : keyof Services[L]>
  ): this

  /**
   * Unregister an existing service.
   *
   * @param path The name of the service to unregister
   */
  unuse<L extends keyof Services & string>(
    path: L
  ): Promise<FeathersService<this, keyof any extends keyof Services ? Service : Services[L]>>

  /**
   * Get the Feathers service instance for a path. This will
   * be the service originally registered with Feathers functionality
   * like hooks and events added.
   *
   * @param path The name of the service.
   */
  service<L extends keyof Services & string>(
    path: L
  ): FeathersService<this, keyof any extends keyof Services ? Service : Services[L]>

  /**
   * Set up the application and call all services `.setup` method if available.
   *
   * @param server A server instance (optional)
   */
  setup(server?: any): Promise<this>

  /**
   * Tear down the application and call all services `.teardown` method if available.
   *
   * @param server A server instance (optional)
   */
  teardown(server?: any): Promise<this>

  /**
   * Register application level hooks.
   *
   * @param map The application hook settings.
   */
  hooks(map: ApplicationHookOptions<this>): this
}

// This needs to be an interface instead of a type
// so that the declaration can be extended by other modules
export interface Application<Services = any, Settings = any>
  extends FeathersApplication<Services, Settings>,
    EventEmitter {}

export type Id = number | string
export type NullableId = Id | null

export interface Query {
  [key: string]: any
}

export interface Params<Q = Query> {
  query?: Q
  provider?: string
  route?: { [key: string]: any }
  headers?: { [key: string]: any }
}

export interface PaginationOptions {
  default?: number
  max?: number
}

export type PaginationParams = false | PaginationOptions

export interface Http {
  /**
   * A writeable, optional property with status code override.
   */
  status?: number
  /**
   * A writeable, optional property with headers.
   */
  headers?: { [key: string]: string | string[] }
  /**
   * A writeable, optional property with `Location` header's value.
   */
  location?: string
}

export type HookType = 'before' | 'after' | 'error' | 'around'

type Serv<FA> = FA extends Application<infer S> ? S : never

export interface HookContext<A = Application, S = any> extends BaseHookContext<ServiceGenericType<S>> {
  /**
   * A read only property that contains the Feathers application object. This can be used to
   * retrieve other services (via context.app.service('name')) or configuration values.
   */
  readonly app: A
  /**
   * A read only property with the name of the service method (one of find, get,
   * create, update, patch, remove).
   */
  readonly method: string
  /**
   * A read only property and contains the service name (or path) without leading or
   * trailing slashes.
   */
  path: 0 extends 1 & S ? keyof Serv<A> & string : GetKeyByValue<Serv<A>, S> & string
  /**
   * A read only property and contains the service this hook currently runs on.
   */
  readonly service: S
  /**
   * A read only property with the hook type (one of 'around', 'before', 'after' or 'error').
   */
  readonly type: HookType
  /**
   * The list of method arguments. Should not be modified, modify the
   * `params`, `data` and `id` properties instead.
   */
  readonly arguments: any[]
  /**
   * A writeable property containing the data of a create, update and patch service
   * method call.
   */
  data?: ServiceGenericData<S>
  /**
   * A writeable property with the error object that was thrown in a failed method call.
   * It is only available in error hooks.
   */
  error?: any
  /**
   * A writeable property and the id for a get, remove, update and patch service
   * method call. For remove, update and patch context.id can also be null when
   * modifying multiple entries. In all other cases it will be undefined.
   */
  id?: Id
  /**
   * A writeable property that contains the service method parameters (including
   * params.query).
   */
  params: ServiceGenericParams<S>
  /**
   * A writeable property containing the result of the successful service method call.
   * It is only available in after hooks.
   *
   * `context.result` can also be set in
   *
   * - A before hook to skip the actual service method (database) call
   * - An error hook to swallow the error and return a result instead
   */
  result?: ServiceGenericType<S>
  /**
   * A writeable, optional property and contains a 'safe' version of the data that
   * should be sent to any client. If context.dispatch has not been set context.result
   * will be sent to the client instead.
   */
  dispatch?: ServiceGenericType<S>
  /**
   * A writeable, optional property that allows to override the standard HTTP status
   * code that should be returned.
   *
   * @deprecated Use `http.status` instead.
   */
  statusCode?: number
  /**
   * A writeable, optional property with options specific to HTTP transports.
   */
  http?: Http
  /**
   * The event emitted by this method. Can be set to `null` to skip event emitting.
   */
  event: string | null
}

// Regular hook typings
export type HookFunction<A = Application, S = Service> = (
  this: S,
  context: HookContext<A, S>
) => Promise<HookContext<Application, S> | void> | HookContext<Application, S> | void

export type Hook<A = Application, S = Service> = HookFunction<A, S>

type HookMethodMap<A, S> = {
  [L in keyof S]?: SelfOrArray<HookFunction<A, S>>
} & { all?: SelfOrArray<HookFunction<A, S>> }

type HookTypeMap<A, S> = SelfOrArray<HookFunction<A, S>> | HookMethodMap<A, S>

// New @feathersjs/hook typings
export type AroundHookFunction<A = Application, S = Service> = (
  context: HookContext<A, S>,
  next: NextFunction
) => Promise<void>

export type AroundHookMap<A, S> = {
  [L in keyof S]?: AroundHookFunction<A, S>[]
} & { all?: AroundHookFunction<A, S>[] }

export type HookMap<A, S> = {
  around?: AroundHookMap<A, S>
  before?: HookTypeMap<A, S>
  after?: HookTypeMap<A, S>
  error?: HookTypeMap<A, S>
}

export type HookOptions<A, S> = AroundHookMap<A, S> | AroundHookFunction<A, S>[] | HookMap<A, S>

export interface ApplicationHookContext<A = Application> extends BaseHookContext {
  app: A
  server: any
}

export type ApplicationHookFunction<A> = (
  context: ApplicationHookContext<A>,
  next: NextFunction
) => Promise<void>

export type ApplicationHookMap<A> = {
  setup?: ApplicationHookFunction<A>[]
  teardown?: ApplicationHookFunction<A>[]
}

export type ApplicationHookOptions<A> = HookOptions<A, any> | ApplicationHookMap<A>
