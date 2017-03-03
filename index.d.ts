import * as express from 'express';
import * as expressCore from "express-serve-static-core";
import * as events from 'events';

declare function feathers(): feathers.Application;

declare namespace feathers {
  export var static: typeof express.static;
 
  type NullableId = number | string | null;

  interface Params {
    query?: any;
  }
  
  interface Pagination <T> {
    total: Number,
    limit: Number,
    skip: Number,
    data: T
  }

  interface Service<T> extends events.EventEmitter {

    /**
     * Retrieves a list of all resources from the service.
     * Provider parameters will be passed as params.query
     */
    find(params?: Params, callback?: any): Promise<T[] | Pagination<T>>;

    /**
     * Retrieves a single resource with the given id from the service.
     */
    get(id: number | string, params?: Params, callback?: any): Promise<T>;

    /**
     * Creates a new resource with data. 
     */
    create(data: T | T[], params?: Params, callback?: any): Promise<T | T[]>;

    /**
     * Replaces the resource identified by id with data.
     * Update multiples resources with id equal `null` 
     */
    update(id: NullableId, data: T, params?: Params, callback?: any): Promise<T>;

    /**
     * Merges the existing data of the resource identified by id with the new data.
     * Implement patch additionally to update if you want to separate between partial and full updates and support the PATCH HTTP method.
     * Patch multiples resources with id equal `null`
     */
    patch(id: NullableId, data: any, params?: Params, callback?: any): Promise<T>;

    /**
     * Removes the resource with id.
     * Delete multiple resources with id equal `null`
     */
    remove(id: NullableId, params?: Params, callback?: any): Promise<T>;

    /**
     * Initialize your service with any special configuration or if connecting services that are very tightly coupled 
     */
    setup(app?: Application, path?: string): void;
  }

  interface FeathersUseHandler<T> extends expressCore.IRouterHandler<T>, express.IRouterMatcher<T> {
    (location: string, service: Service<any>): T
  }

  interface Application extends express.Application {
    /**
     * It either returns the Feathers wrapped service object for the given path
     */
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
     * Register a service object 
     */
    use: FeathersUseHandler<this>;
  }
}

export = feathers;
