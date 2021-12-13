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
  RegularHookMap,
  Setup
} from './declarations';
import { enableRegularHooks } from './hooks/regular';

const debug = createDebug('@feathersjs/feathers');

export class Feathers<Services, Settings> extends EventEmitter implements FeathersApplication<Services, Settings> {
  services: Services = ({} as Services);
  settings: Settings = ({} as Settings);
  mixins: ServiceMixin<Application<Services, Settings>>[] = [ hookMixin, eventMixin ];
  version: string = version;
  _isSetup = false;
  appHooks: HookMap<Application<Services, Settings>, any> = {
    [HOOKS]: [ (eventHook as any) ]
  };

  private regularHooks: (this: any, allHooks: any) => any;
  private setups: Setup<this>[] = [];

  constructor () {
    super();
    this.regularHooks = enableRegularHooks(this);
  }

  get<L extends keyof Settings & string> (name: L): Settings[L] {
    return this.settings[name];
  }

  set<L extends keyof Settings & string> (name: L, value: Settings[L]) {
    this.settings[name] = value;
    return this;
  }

  configure (callback: (this: this, app: this) => void) {
    callback.call(this, this);

    return this;
  }

  defaultService (location: string): ServiceInterface {
    throw new Error(`Can not find service '${location}'`);
  }

  service<L extends keyof Services & string> (
    location: L
  ): FeathersService<this, keyof any extends keyof Services ? Service : Services[L]> {
    const path = (stripSlashes(location) || '/') as L;
    const current = this.services[path];

    if (typeof current === 'undefined') {
      this.use(path, this.defaultService(path) as any);
      return this.service(path);
    }

    return current as any;
  }

  use<L extends keyof Services & string> (
    path: L,
    service: keyof any extends keyof Services ? ServiceInterface | Application : Services[L],
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

    this.services[location] = protoService;

    if (typeof protoService.setup === 'function') {
      const setup = () => {
        debug(`Setting up service for \`${location}\``);
        return protoService.setup(this, location);
      };

      if (this._isSetup) {
        setup(); // If we ran setup already, set this service up explicitly, this will not `await`
      } else {
        this.addSetup(setup);
      }
    }

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
      const methodHookMap = hookMap as HookMap<Application<Services, Settings>, any>;

      Object.keys(methodHookMap).forEach(key => {
        const methodHooks = this.appHooks[key] || [];

        this.appHooks[key] = methodHooks.concat(methodHookMap[key]);
      });
    }

    return this;
  }

  addSetup (setup: Setup<this>) {
    if (this._isSetup) {
      throw new Error(`Cannot add a setup step after app.setup() was called.`);
    }

    this.setups.push(setup);

    return this;
  }

  setup (server?: any) {
    this._isSetup = true;

    const promise = this.setups.reduce((promise, setup) => {
      return promise.then(() => setup(this, server));
    }, Promise.resolve());

    return promise.then(() => this);
  }
}
