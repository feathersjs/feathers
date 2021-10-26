import {
  EventEmitter, NextFunction, HookContext as BaseHookContext
} from './dependencies';

type SelfOrArray<S> = S | S[];
type OptionalPick<T, K extends PropertyKey> = Pick<T, Extract<keyof T, K>>

export type { NextFunction };

export interface Paginated<T> {
  total: number;
  limit: number;
  skip: number;
  data: T[];
}

export interface ServiceOptions {
  events?: string[];
  methods?: string[];
  serviceEvents?: string[];
}

export interface ServiceMethods<T, D = Partial<T>> {
  find (params?: Params): Promise<T | T[]>;

  get (id: Id, params?: Params): Promise<T>;

  create (data: D, params?: Params): Promise<T>;

  update (id: NullableId, data: D, params?: Params): Promise<T | T[]>;

  patch (id: NullableId, data: D, params?: Params): Promise<T | T[]>;

  remove (id: NullableId, params?: Params): Promise<T | T[]>;

  setup (app: Application, path: string): Promise<void>;
}

export interface ServiceOverloads<T, D> {
  create? (data: D[], params?: Params): Promise<T[]>;

  update? (id: Id, data: D, params?: Params): Promise<T>;

  update? (id: null, data: D, params?: Params): Promise<T[]>;

  patch? (id: Id, data: D, params?: Params): Promise<T>;

  patch? (id: null, data: D, params?: Params): Promise<T[]>;

  remove? (id: Id, params?: Params): Promise<T>;

  remove? (id: null, params?: Params): Promise<T[]>;
}

export type Service<T, D = Partial<T>> =
  ServiceMethods<T, D> &
  ServiceOverloads<T, D>;

export type ServiceInterface<T, D = Partial<T>> =
  Partial<ServiceMethods<T, D>>;

export interface ServiceAddons<A = Application, S = Service<any, any>> extends EventEmitter {
  id?: string;
  hooks (options: HookOptions<A, S>): this;
}

export interface ServiceHookOverloads<S> {
  find (
    params: Params,
    context: HookContext
  ): Promise<HookContext>;

  get (
    id: Id,
    params: Params,
    context: HookContext
  ): Promise<HookContext>;

  create (
    data: ServiceGenericData<S> | ServiceGenericData<S>[],
    params: Params,
    context: HookContext
  ): Promise<HookContext>;

  update (
    id: NullableId,
    data: ServiceGenericData<S>,
    params: Params,
    context: HookContext
  ): Promise<HookContext>;

  patch (
    id: NullableId,
    data: ServiceGenericData<S>,
    params: Params,
    context: HookContext
  ): Promise<HookContext>;

  remove (
    id: NullableId,
    params: Params,
    context: HookContext
  ): Promise<HookContext>;
}

export type FeathersService<A = FeathersApplication, S = Service<any>> =
  S & ServiceAddons<A, S> & OptionalPick<ServiceHookOverloads<S>, keyof S>;

export type CustomMethod<Methods extends string> = {
  [k in Methods]: <X = any> (data: any, params?: Params) => Promise<X>;
}

export type ServiceMixin<A> = (service: FeathersService<A>, path: string, options?: ServiceOptions) => void;

export type ServiceGenericType<S> = S extends ServiceInterface<infer T> ? T : any;
export type ServiceGenericData<S> = S extends ServiceInterface<infer _T, infer D> ? D : any;

export interface FeathersApplication<Services = any, Settings = any> {
  /**
   * The Feathers application version
   */
  version: string;

  /**
   * A list of callbacks that run when a new service is registered
   */
  mixins: ServiceMixin<Application<Services, Settings>>[];

  /**
   * The index of all services keyed by their path.
   *
   * __Important:__ Services should always be retrieved via `app.service('name')`
   * not via `app.services`.
   */
  services: Services;

  /**
   * The application settings that can be used via
   * `app.get` and `app.set`
   */
  settings: Settings;

  /**
   * A private-ish indicator if `app.setup()` has been called already
   */
  _isSetup: boolean;

  /**
   * Contains all registered application level hooks.
   */
  appHooks: HookMap<Application<Services, Settings>, any>;

  /**
   * Retrieve an application setting by name
   *
   * @param name The setting name
   */
  get<L extends keyof Settings & string> (name: L): Settings[L];

  /**
   * Set an application setting
   *
   * @param name The setting name
   * @param value The setting value
   */
  set<L extends keyof Settings & string> (name: L, value: Settings[L]): this;

  /**
   * Runs a callback configure function with the current application instance.
   *
   * @param callback The callback `(app: Application) => {}` to run
   */
  configure (callback: (this: this, app: this) => void): this;

  /**
   * Returns a fallback service instance that will be registered
   * when no service was found. Usually throws a `NotFound` error
   * but also used to instantiate client side services.
   *
   * @param location The path of the service
   */
  defaultService (location: string): ServiceInterface<any>;

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
  use<L extends keyof Services & string> (
    path: L,
    service: keyof any extends keyof Services ? ServiceInterface | Application : Services[L],
    options?: ServiceOptions
  ): this;

  /**
   * Get the Feathers service instance for a path. This will
   * be the service originally registered with Feathers functionality
   * like hooks and events added.
   *
   * @param path The name of the service.
   */
  service<L extends keyof Services & string> (
    path: L
  ): FeathersService<this, keyof any extends keyof Services ? Service<any> : Services[L]>;

  setup (server?: any): Promise<this>;

  /**
   * Register application level hooks.
   *
   * @param map The application hook settings.
   */
  hooks (map: HookOptions<this, any>): this;
}

// This needs to be an interface instead of a type
// so that the declaration can be extended by other modules
export interface Application<Services = any, Settings = any> extends FeathersApplication<Services, Settings>, EventEmitter {

}

export type Id = number | string;
export type NullableId = Id | null;

export interface Query {
  [key: string]: any;
}

export interface Params {
  query?: Query;
  provider?: string;
  route?: { [key: string]: string };
  headers?: { [key: string]: any };
  [key: string]: any; // (JL) not sure if we want this
}

export interface HookContext<A = Application, S = any> extends BaseHookContext<ServiceGenericType<S>> {
  /**
   * A read only property that contains the Feathers application object. This can be used to
   * retrieve other services (via context.app.service('name')) or configuration values.
   */
  readonly app: A;
  /**
   * A read only property with the name of the service method (one of find, get,
   * create, update, patch, remove).
   */
  readonly method: string;
  /**
   * A read only property and contains the service name (or path) without leading or
   * trailing slashes.
   */
  readonly path: string;
  /**
   * A read only property and contains the service this hook currently runs on.
   */
  readonly service: S;
  /**
   * A read only property with the hook type (one of before, after or error).
   * Will be `null` for asynchronous hooks.
   */
  readonly type: null | 'before' | 'after' | 'error';
  /**
   * The list of method arguments. Should not be modified, modify the
   * `params`, `data` and `id` properties instead.
   */
  readonly arguments: any[];
  /**
   * A writeable property containing the data of a create, update and patch service
   * method call.
   */
  data?: ServiceGenericData<S>;
  /**
   * A writeable property with the error object that was thrown in a failed method call.
   * It is only available in error hooks.
   */
  error?: any;
  /**
   * A writeable property and the id for a get, remove, update and patch service
   * method call. For remove, update and patch context.id can also be null when
   * modifying multiple entries. In all other cases it will be undefined.
   */
  id?: Id;
  /**
   * A writeable property that contains the service method parameters (including
   * params.query).
   */
  params: Params;
  /**
   * A writeable property containing the result of the successful service method call.
   * It is only available in after hooks.
   *
   * `context.result` can also be set in
   *
   * - A before hook to skip the actual service method (database) call
   * - An error hook to swallow the error and return a result instead
   */
  result?: ServiceGenericType<S>;
  /**
   * A writeable, optional property and contains a 'safe' version of the data that
   * should be sent to any client. If context.dispatch has not been set context.result
   * will be sent to the client instead.
   */
  dispatch?: ServiceGenericType<S>;
  /**
   * A writeable, optional property that allows to override the standard HTTP status
   * code that should be returned.
   */
  statusCode?: number;
  /**
   * The event emitted by this method. Can be set to `null` to skip event emitting.
   */
  event: string|null;
}

// Legacy hook typings
export type LegacyHookFunction<A = Application, S = Service<any, any>> =
  (this: S, context: HookContext<A, S>) => (Promise<HookContext<Application, S> | void> | HookContext<Application, S> | void);

export type Hook<A = Application, S = Service<any, any>> = LegacyHookFunction<A, S>;

type LegacyHookMethodMap<A, S> =
  { [L in keyof S]?: SelfOrArray<LegacyHookFunction<A, S>>; } &
  { all?: SelfOrArray<LegacyHookFunction<A, S>> };

type LegacyHookTypeMap<A, S> =
  SelfOrArray<LegacyHookFunction<A, S>> | LegacyHookMethodMap<A, S>;

export type LegacyHookMap<A, S> = {
  before?: LegacyHookTypeMap<A, S>,
  after?: LegacyHookTypeMap<A, S>,
  error?: LegacyHookTypeMap<A, S>
}

// New @feathersjs/hook typings
export type HookFunction<A = Application, S = Service<any, any>> =
  (context: HookContext<A, S>, next: NextFunction) => Promise<void>;

export type HookMap<A, S> = {
  [L in keyof S]?: HookFunction<A, S>[];
};

export type HookOptions<A, S> =
  HookMap<A, S> | HookFunction<A, S>[] | LegacyHookMap<A, S>;
