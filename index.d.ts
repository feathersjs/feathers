import * as express from 'express';
import * as expressCore from 'express-serve-static-core';
import * as events from 'events';

declare function feathers<ServiceListInterface = {}>(): feathers.Application<ServiceListInterface>;

declare namespace feathers {
  export var static: typeof express.static;

  type NullableId = number | string | null;

  interface Params {
    query?: any;
    paginate?: false | object;
  }

  interface Pagination <T> {
    total: Number;
    limit: Number;
    skip: Number;
    data: T[];
  }

  interface FindService<T> {
    /**
     * Retrieves a list of all resources from the service.
     * Provider parameters will be passed as params.query
     */
    find(params?: Params, callback?: any): Promise<T[] | Pagination<T>>;
  }

  interface GetService<T> {
    /**
     * Retrieves a single resource with the given id from the service.
     */
    get(id: number | string, params?: Params, callback?: any): Promise<T>;
  }

  interface CreateService<T> {
    /**
     * Creates a new resource with data.
     */
    create(data: T[], params?: Params, callback?: any): Promise<T[]>;
    create(data: T, params?: Params, callback?: any): Promise<T>;
  }

  interface UpdateService<T> {
    /**
     * Replaces the resource identified by id with data.
     * Update multiples resources with id equal `null`
     */
    update(id: NullableId, data: T, params?: Params, callback?: any): Promise<T>;
  }

  interface PatchService<T> {
    /**
     * Merges the existing data of the resource identified by id with the new data.
     * Implement patch additionally to update if you want to separate between partial and full updates and support the PATCH HTTP method.
     * Patch multiples resources with id equal `null`
     */
    patch(id: NullableId, data: any, params?: Params, callback?: any): Promise<T>;
  }

  interface RemoveService<T> {
    /**
     * Removes the resource with id.
     * Delete multiple resources with id equal `null`
     */
    remove(id: NullableId, params?: Params, callback?: any): Promise<T>;
  }

  interface FullService<T> extends GetService<T>, FindService<T>, CreateService<T>, UpdateService<T>, PatchService<T>, RemoveService<T> {}

  interface OptionalMethods <T> {
    find?(params?: Params, callback?: any): Promise<T[] | Pagination<T>>;
    get?(id: number | string, params?: Params, callback?: any): Promise<T>;
    create?(data: T[], params?: Params, callback?: any): Promise<T[]>;
    create?(data: T, params?: Params, callback?: any): Promise<T>;
    update?(id: NullableId, data: T, params?: Params, callback?: any): Promise<T>;
    patch?(id: NullableId, data: any, params?: Params, callback?: any): Promise<T>;
    remove?(id: NullableId, params?: Params, callback?: any): Promise<T>;
  }

  interface Setup {
    setup?(app?: Application<any>, path?: string): void;
  }

  interface ServiceDefinition<T> extends OptionalMethods<T>, Setup {}

  interface ServiceAddons extends events.EventEmitter {
    filter(any?: any): this;
  }

  interface Service<T> extends OptionalMethods<T>, ServiceAddons {}

  interface FeathersUseHandler<T> extends expressCore.IRouterHandler<T>, express.IRouterMatcher<T> {
    (location: string, service: ServiceDefinition<any>): T;
  }

  interface Application<ServiceListInterface> extends express.Application {
    /**
     * Register a service object
     */
    use: FeathersUseHandler<this>;

    /**
     * It either returns the Feathers wrapped service object for the given path
     */
    service<K extends keyof ServiceListInterface>(location: K): ServiceListInterface[K] & ServiceAddons;
    service<T>(location: string): Service<T>;

    /**
     * Registers a new service for that path and returns the wrapped service object
     */
    service<T>(location: string, service: Service<T>, options?: any): Service<T>;

    /**
     *  Initialize all services by calling each services .setup(app, path) method (if available)
     */
    setup(): this;

    /**
     * Runs a callback function with the application as the context (this). It can be used to initialize plugins or services.
     */
    configure(callback: any): this;
  }
}

export = feathers;
