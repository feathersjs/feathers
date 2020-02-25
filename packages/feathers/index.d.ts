/// <reference types='node' />

import { EventEmitter } from 'events';
import * as http from 'http';

declare const createApplication: Feathers;
export = createApplication;

interface Feathers {
    <T = any>(): createApplication.Application<T>;
    readonly ACTIVATE_HOOKS: unique symbol;
    version: string;
    default: Feathers;
    // TODO: Write a definition for activateHooks.
    // activateHooks(): void
}

declare namespace createApplication {
    type Id = number | string;
    type NullableId = Id | null;

    interface Query {
        [key: string]: any;
    }

    interface PaginationOptions {
        default: number;
        max: number;
    }

    type ClientSideParams = Pick<Params, 'query' | 'paginate'>;
    type ServerSideParams = Params;

    interface Params {
        query?: Query;
        paginate?: false | Pick<PaginationOptions, 'max'>;
        provider?: string;
        route?: {[key: string]: string};
        headers?: {[key: string]: any};

        [key: string]: any; // (JL) not sure if we want this
    }

    interface Paginated<T> {
        total: number;
        limit: number;
        skip: number;
        data: T[];
    }

    // tslint:disable-next-line void-return
    type Hook<T = any, S = Service<T>> = (hook: HookContext<T, S>) => (Promise<HookContext<T, S> | void> | HookContext<T, S> | void);

    interface HookContext<T = any, S = Service<T>> {
        /**
         * A read only property that contains the Feathers application object. This can be used to
         * retrieve other services (via context.app.service('name')) or configuration values.
         */
        readonly app: Application;
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
        id?: string | number;
        /**
         * A read only property with the name of the service method (one of find, get,
         * create, update, patch, remove).
         */
        readonly method: string;
        /**
         * A writeable property that contains the service method parameters (including
         * params.query).
         */
        params: Params;
        /**
         * A read only property and contains the service name (or path) without leading or
         * trailing slashes.
         */
        readonly path: string;
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
         * A read only property and contains the service this hook currently runs on.
         */
        readonly service: S;
        /**
         * A writeable, optional property and contains a 'safe' version of the data that
         * should be sent to any client. If context.dispatch has not been set context.result
         * will be sent to the client instead.
         */
        dispatch?: T;
        /**
         * A writeable, optional property that allows to override the standard HTTP status
         * code that should be returned.
         */
        statusCode?: number;
        /**
         * A read only property with the hook type (one of before, after or error).
         */
        readonly type: 'before' | 'after' | 'error';
    }

    interface HookMap<T = any> {
        all: Hook<T> | Hook<T>[];
        find: Hook<T> | Hook<T>[];
        get: Hook<T> | Hook<T>[];
        create: Hook<T> | Hook<T>[];
        update: Hook<T> | Hook<T>[];
        patch: Hook<T> | Hook<T>[];
        remove: Hook<T> | Hook<T>[];
    }

    interface HooksObject<T = any> {
        before: Partial<HookMap<T>> | Hook<T> | Hook<T>[];
        after: Partial<HookMap<T>> | Hook<T> | Hook<T>[];
        error: Partial<HookMap<T>> | Hook<T> | Hook<T>[];
        finally?: Partial<HookMap<T>> | Hook<T> | Hook<T>[];
    }

    interface ServiceMethods<T> {
        [key: string]: any;

        find (params?: Params): Promise<T | T[] | Paginated<T>>;

        get (id: Id, params?: Params): Promise<T>;

        create (data: Partial<T> | Partial<T>[], params?: Params): Promise<T | T[]>;

        update (id: NullableId, data: T, params?: Params): Promise<T | T[]>;

        patch (id: NullableId, data: Partial<T>, params?: Params): Promise<T | T[]>;

        remove (id: NullableId, params?: Params): Promise<T | T[]>;
    }

    interface SetupMethod {
        setup (app: Application, path: string): void;
    }

    interface ServiceOverloads<T> {
        create? (data: Partial<T>, params?: Params): Promise<T>;

        create? (data: Partial<T>[], params?: Params): Promise<T[]>;

        update? (id: Id, data: T, params?: Params): Promise<T>;

        update? (id: null, data: T, params?: Params): Promise<T[]>;

        patch? (id: Id, data: Partial<T>, params?: Params): Promise<T>;

        patch? (id: null, data: Partial<T>, params?: Params): Promise<T[]>;

        remove? (id: Id, params?: Params): Promise<T>;

        remove? (id: null, params?: Params): Promise<T[]>;
    }

    interface ServiceAddons<T> extends EventEmitter {
        id?: any;
        _serviceEvents: string[];
        methods: {[method: string]: string[]};
        hooks (hooks: Partial<HooksObject>): this;
    }

    type Service<T> = ServiceOverloads<T> & ServiceAddons<T> & ServiceMethods<T>;

    type ServiceMixin = (service: Service<any>, path: string) => void;

    interface Application<ServiceTypes = {}> extends EventEmitter {
        version: string;

        services: keyof ServiceTypes extends never ? any : ServiceTypes;

        mixins: ServiceMixin[];

        methods: string[];

        get (name: string): any;

        set (name: string, value: any): this;

        disable (name: string): this;

        disabled (name: string): boolean;

        enable (name: string): this;

        enabled (name: string): boolean;

        configure (callback: (this: this, app: this) => void): this;

        hooks (hooks: Partial<HooksObject>): this;

        setup (server?: any): this;

        service<L extends keyof ServiceTypes> (location: L): ServiceTypes[L];

        service (location: string): keyof ServiceTypes extends never ? any : never;

        use (path: string, service: Partial<ServiceMethods<any> & SetupMethod> | Application, options?: any): this;

        listen (port: number): http.Server;
    }
}
