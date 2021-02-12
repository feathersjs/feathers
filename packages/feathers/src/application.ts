import Debug from 'debug';
import { EventEmitter } from 'events';
import { stripSlashes } from '@feathersjs/commons';

import version from './version';
import { eventMixin } from './events';
import { hookMixin } from './hooks';
import { wrapService, getServiceOptions } from './service';
import {
  FeathersApplication,
  ServiceMixin,
  Service,
  ServiceOptions,
  ServiceAddons,
  Application,
  BaseService
} from './declarations';

const debug = Debug('@feathersjs/feathers');

export class Feathers<ServiceTypes, AppSettings> extends EventEmitter implements FeathersApplication<ServiceTypes, AppSettings> {
  services: ServiceTypes = ({} as ServiceTypes);
  settings: AppSettings = ({} as AppSettings);
  mixins: ServiceMixin[] = [ hookMixin, eventMixin ];
  version: string = version;
  _isSetup = false;

  get<L extends keyof AppSettings> (
    name: AppSettings[L] extends never ? string : L
  ): (AppSettings[L] extends never ? any : AppSettings[L])|undefined {
    return (this.settings as any)[name];
  }

  set<L extends keyof AppSettings> (
    name: AppSettings[L] extends never ? string : L,
    value: AppSettings[L] extends never ? any : AppSettings[L]
  ) {
    (this.settings as any)[name] = value;
    return this;
  }

  configure (callback: (this: this, app: this) => void) {
    callback.call(this, this);

    return this;
  }

  defaultService (location: string): BaseService {
    throw new Error(`Can not find service '${location}'`);
  }

  service<L extends keyof ServiceTypes> (
    location: ServiceTypes[L] extends never ? string : L
  ): (ServiceTypes[L] extends never ? Service<any> : (
    ServiceTypes[L] & ServiceAddons<any, Application<ServiceTypes, AppSettings>, any>
  )) {
    const path: any = stripSlashes(location as string) || '/';
    const current = (this.services as any)[path];

    if (typeof current === 'undefined') {
      this.use(path, this.defaultService(path) as any);
      return this.service(path);
    }

    return current;
  }

  use<L extends keyof ServiceTypes> (
    path: ServiceTypes[L] extends never ? string : L,
    service: (ServiceTypes[L] extends never ?
      BaseService : ServiceTypes[L]
    ) | FeathersApplication,
    options: ServiceOptions = {}
  ): this {
    if (typeof path !== 'string') {
      throw new Error(`'${path}' is not a valid service path.`);
    }

    const location = stripSlashes(path) || '/';
    const subApp = service as FeathersApplication;
    const isSubApp = typeof subApp.service === 'function' && subApp.services;

    if (isSubApp) {
      Object.keys(subApp.services).forEach(subPath =>
        this.use(`${location}/${subPath}` as any, subApp.service(subPath) as any)
      );

      return this;
    }

    const protoService = wrapService(location, service, options);
    const serviceOptions = getServiceOptions(service);

    debug(`Registering new service at \`${location}\``);

    // Add all the mixins
    this.mixins.forEach(fn => fn.call(this, protoService, location, serviceOptions));

    // If we ran setup already, set this service up explicitly, this will not `await`
    if (this._isSetup && typeof protoService.setup === 'function') {
      debug(`Setting up service for \`${location}\``);
      protoService.setup(this, location);
    }

    (this.services as any)[location] = protoService;

    return this;
  }

  async setup () {
    // Setup each service (pass the app so that they can look up other services etc.)
    for (const path of Object.keys(this.services)) {
      const service: any = this.service(path as any);
      
      if (typeof service.setup === 'function') {
        debug(`Setting up service for \`${path}\``);

        await service.setup(this, path);
      }
    }

    this._isSetup = true;

    return this;
  }
}
