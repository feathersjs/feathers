import { createSymbol } from '@feathersjs/commons';
import { ServiceOptions, Service } from './declarations';

type ServiceMethodOptions = ServiceOptions<any>['methods'];

export const SERVICE = createSymbol('@feathersjs/service');

export const defaultServiceArguments: { [key: string]: string[] } = {
  find: [ 'params' ],
  get: [ 'id', 'params' ],
  create: [ 'data', 'params' ],
  update: [ 'id', 'data', 'params' ],
  patch: [ 'id', 'data', 'params' ],
  remove: [ 'id', 'params' ],
  setup: ['app', 'path']
}

export const defaultServiceMethods: ServiceMethodOptions = {
  find: { external: true },
  get: { external: true },
  create: {
    event: 'created',
    external: true
  },
  update: {
    event: 'updated',
    external: true
  },
  patch: {
    event: 'patched',
    external: true
  },
  remove: {
    event: 'removed',
    external: true
  },
  setup: {
    external: false
  }
};

export function getServiceOptions<S> (
  service: S, options: ServiceOptions<S> = {}
): ServiceOptions<S> {
  const existingOptions = (service as any)[SERVICE];

  if (existingOptions) {
    return existingOptions;
  }

  const events = [].concat(options.events || []).concat((service as any).events || []);
  const existingMethods = options.methods || defaultServiceMethods;
  const methods: ServiceMethodOptions = {};

  for (const name of Object.keys(existingMethods)) {
    if (typeof (service as any)[name] === 'function') {
      const definition = (existingMethods as any)[name];
      const defaultDefinition = defaultServiceMethods[name];
      const mergedDefinition = {
        ...defaultDefinition,
        ...definition
      }

      methods[name] = mergedDefinition;
    }
  }

  return { events, methods };
}

export function wrapService<S = Service<any>> (
  location: string, service: S, options: ServiceOptions<S>
) {
  // Do nothing if this is already an initialized
  if ((service as any)[SERVICE]) {
    return service;
  }

  const protoService = Object.create(service as any);
  const serviceOptions = getServiceOptions(service, options);
  
  if (Object.keys(serviceOptions.methods).length === 0) {
    throw new Error(`Invalid service object passed for path \`${location}\``);
  }

  Object.defineProperty(protoService, SERVICE, {
    value: serviceOptions
  });

  return protoService;
}
