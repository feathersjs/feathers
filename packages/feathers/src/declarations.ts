import { EventEmitter } from 'events';
import {
  NextFunction, HookContext as BaseHookContext
} from '@feathersjs/hooks';

export interface ServiceOptions {
  events?: string[];
  methods?: string[];
}

export interface ServiceMethods<T> {
  find (params?: Params): Promise<T | T[]>;

  get (id: Id, params?: Params): Promise<T>;

  create (data: Partial<T> | Partial<T>[], params?: Params): Promise<T | T[]>;

  update (id: NullableId, data: T, params?: Params): Promise<T | T[]>;

  patch (id: NullableId, data: Partial<T>, params?: Params): Promise<T | T[]>;

  remove (id: NullableId, params?: Params): Promise<T | T[]>;
}

export interface SetupMethod {
  setup (app: FeathersApplication, path: string): void;
}

export interface ServiceOverloads<T> {
  create? (data: Partial<T>, params?: Params): Promise<T>;

  create? (data: Partial<T>[], params?: Params): Promise<T[]>;

  update? (id: Id, data: T, params?: Params): Promise<T>;

  update? (id: null, data: T, params?: Params): Promise<T[]>;

  patch? (id: Id, data: Partial<T>, params?: Params): Promise<T>;

  patch? (id: null, data: Partial<T>, params?: Params): Promise<T[]>;

  remove? (id: Id, params?: Params): Promise<T>;

  remove? (id: null, params?: Params): Promise<T[]>;
}

export interface ServiceAddons<_T, _A, _S> extends EventEmitter {
  id?: any;
  hooks (hooks: any): this;
  // hooks (hooks: HookSettings<T, A, S>): this;
  // hooks (map: BaseHookMap) : this;
}

export type Service<T> = ServiceOverloads<T> & ServiceAddons<T, any, any> & ServiceMethods<T>;

export type ServiceMixin = (service: Service<any>, path: string, options?: any) => void;

export type ServiceGeneric<T> = T extends Service<infer U> ? U : any;

export type BaseService = Partial<ServiceMethods<any> & SetupMethod>;

export interface FeathersApplication<ServiceTypes = {}, AppSettings = {}> {
  /**
   * The Feathers application version
   */
  version: string;

  /**
   * A list of callbacks that run when a new service is registered
   */
  mixins: ServiceMixin[];

  /**
   * The index of all services keyed by their path.
   */
  services: ServiceTypes;

  /**
   * The application settings that can be used via
   * `app.get` and `app.set`
   */
  settings: AppSettings;

  /**
   * A private-ish indicator if `app.setup()` has been called already
   */
  _isSetup: boolean;

  /**
   * Retrieve an application setting by name
   * @param name The setting name
   */
  get<L extends keyof AppSettings> (
    name: AppSettings[L] extends never ? string : L
  ): (AppSettings[L] extends never ? any : AppSettings[L]);

  /**
   * Set an application setting
   * @param name The setting name
   * @param value The setting value
   */
  set<L extends keyof AppSettings> (
    name: AppSettings[L] extends never ? string : L,
    value: AppSettings[L] extends never ? any : AppSettings[L]
  ): this;

  configure (callback: (this: this, app: this) => void): this;

  /**
   * Register a new service
   * @param path The path for the service to register
   * @param service The service object to register
   * @param options The options for this service
   */
  use<L extends keyof ServiceTypes> (
    path: ServiceTypes[L] extends never ? string : L,
    service: (ServiceTypes[L] extends never ?
      BaseService : ServiceTypes[L]
    ) | FeathersApplication,
    options?: ServiceOptions
  ): this;

  defaultService (location: string): BaseService;

  service<L extends keyof ServiceTypes> (
    location: ServiceTypes[L] extends never ? string : L
  ): (ServiceTypes[L] extends never ? Service<any> : (
    ServiceTypes[L] & ServiceAddons<ServiceGeneric<ServiceTypes[L]>, Application<ServiceTypes, AppSettings>, ServiceTypes[L]>
  ));

  setup (server?: any): Promise<this>;

  // hooks (hooks: any): this;
  
  // listen (port: number): any;
}

export type Application<ServiceTypes = {}, AppSettings = {}> =
  FeathersApplication<ServiceTypes, AppSettings> & EventEmitter;

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

export interface HookContext<T = any, A = FeathersApplication, S = Service<T>> extends BaseHookContext<T> {
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
   */
  readonly type: 'before' | 'after' | 'error' | 'async';
  /**
   * A writeable property containing the data of a create, update and patch service
   * method call.
   */
  data?: T;
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
   *  - A before hook to skip the actual service method (database) call
   *  - An error hook to swallow the error and return a result instead
   */
  result?: T;
  /**
   * A writeable, optional property and contains a 'safe' version of the data that
   * should be sent to any client. If context.dispatch has not been set context.result
   * will be sent to the client instead.
   */
  dispatch?: Partial<T>;
  /**
   * A writeable, optional property that allows to override the standard HTTP status
   * code that should be returned.
   */
  statusCode?: number;
  event: string|null;
  arguments: any[];
}

export type Hook<T = any, A = Application, S = Service<T>> =
  (hook: HookContext<T, A, S>) =>
  (Promise<HookContext<T, S> | void> | HookContext<T, S> | void);

export type AsyncHook<T = any, A = Application, S = Service<T>> =
  (hook: HookContext<T, A, S>, next: NextFunction) => Promise<void>;

export type HookMap<T, A, S, H = Hook<T, A, S>> = {
  [L in keyof S & 'all']: H|H[];
}

export interface HooksObject<T, A, S> {
  async: Partial<HookMap<T, A, S, AsyncHook<T, A, S>>> | AsyncHook<T, A, S>[];
  before: Partial<HookMap<T, A, S>> | Hook<T, A, S>[];
  after: Partial<HookMap<T, A, S>> | Hook<T, A, S>[];
  error: Partial<HookMap<T, A, S>> | Hook<T, A, S>[];
}

export type HookSettings<T, A, S> = Partial<HooksObject<T, A, S>>|
  Partial<HookMap<T, A, S, AsyncHook<T, A, S>>>;
