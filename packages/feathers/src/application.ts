import version from './version';
import {
  EventEmitter, stripSlashes, createDebug, HOOKS
} from './dependencies';
import { eventHook, eventMixin } from './events';
import { hookMixin } from './hooks/index';
import { wrapService, getServiceOptions, protectedMethods } from './service';
import {
  FeathersApplication,
  ServiceMixin,
  Service,
  ServiceOptions,
  ServiceInterface,
  Application,
  HookOptions,
  FeathersService,
  HookMap,
  RegularHookMap
} from './declarations';
import { enableRegularHooks } from './hooks/regular';

const debug = createDebug('@feathersjs/feathers');

export class Feathers<ServiceTypes, AppSettings> extends EventEmitter implements FeathersApplication<ServiceTypes, AppSettings> {
  services: ServiceTypes = ({} as ServiceTypes);
  settings: AppSettings = ({} as AppSettings);
  mixins: ServiceMixin<Application<ServiceTypes, AppSettings>>[] = [ hookMixin, eventMixin ];
  version: string = version;
  _isSetup = false;
  appHooks: HookMap<Application<ServiceTypes, AppSettings>, any> = {
    [HOOKS]: [ (eventHook as any) ]
  };

  private regularHooks: (this: any, allHooks: any) => any;

  constructor () {
    super();
    this.regularHooks = enableRegularHooks(this);
  }

  get<L extends keyof AppSettings & string> (name: L): AppSettings[L] {
    return this.settings[name];
  }

  set<L extends keyof AppSettings & string> (name: L, value: AppSettings[L]) {
    this.settings[name] = value;
    return this;
  }

  configure (callback: (this: this, app: this) => void) {
    callback.call(this, this);

    return this;
  }

  defaultService (location: string): ServiceInterface<any> {
    throw new Error(`Can not find service '${location}'`);
  }

  service<L extends keyof ServiceTypes & string> (
    location: L
  ): FeathersService<this, keyof any extends keyof ServiceTypes ? Service<any> : ServiceTypes[L]> {
    const path = (stripSlashes(location) || '/') as L;
    const current = this.services[path];

    if (typeof current === 'undefined') {
      this.use(path, this.defaultService(path) as any);
      return this.service(path);
    }

    return current as any;
  }

  use<L extends keyof ServiceTypes & string> (
    path: L,
    service: keyof any extends keyof ServiceTypes ? ServiceInterface<any> | Application : ServiceTypes[L],
    options?: ServiceOptions
  ): this {
    if (typeof path !== 'string') {
      throw new Error(`'${path}' is not a valid service path.`);
    }

    const location = (stripSlashes(path) || '/') as L;
    const subApp = service as Application;
    const isSubApp = typeof subApp.service === 'function' && subApp.services;

    if (isSubApp) {
      Object.keys(subApp.services).forEach(subPath =>
        this.use(`${location}/${subPath}` as any, subApp.service(subPath) as any)
      );

      return this;
    }

    const protoService = wrapService(location, service, options);
    const serviceOptions = getServiceOptions(service, options);

    for (const name of protectedMethods) {
      if (serviceOptions.methods.includes(name)) {
        throw new Error(`'${name}' on service '${location}' is not allowed as a custom method name`);
      }
    }

    debug(`Registering new service at \`${location}\``);

    // Add all the mixins
    this.mixins.forEach(fn => fn.call(this, protoService, location, serviceOptions));

    // If we ran setup already, set this service up explicitly, this will not `await`
    if (this._isSetup && typeof protoService.setup === 'function') {
      debug(`Setting up service for \`${location}\``);
      protoService.setup(this, location);
    }

    this.services[location] = protoService;

    return this;
  }

  hooks (hookMap: HookOptions<this, any>) {
    const regularMap = hookMap as RegularHookMap<this, any>;

    if (regularMap.before || regularMap.after || regularMap.error) {
      return this.regularHooks(regularMap);
    }

    if (Array.isArray(hookMap)) {
      this.appHooks[HOOKS].push(...hookMap as any);
    } else {
      const methodHookMap = hookMap as HookMap<Application<ServiceTypes, AppSettings>, any>;

      Object.keys(methodHookMap).forEach(key => {
        const methodHooks = this.appHooks[key] || [];

        this.appHooks[key] = methodHooks.concat(methodHookMap[key]);
      });
    }

    return this;
  }

  setup () {
    let promise = Promise.resolve();

    // Setup each service (pass the app so that they can look up other services etc.)
    for (const path of Object.keys(this.services)) {
      promise = promise.then(() => {
        const service: any = this.service(path as any);

        if (typeof service.setup === 'function') {
          debug(`Setting up service for \`${path}\``);

          return service.setup(this, path);
        }
      });
    }

    return promise.then(() => {
      this._isSetup = true;
      return this;
    });
  }
}
