/// <reference path="./typings/index.d.ts" />

declare module 'feathers' {
  export interface Application {
    all(path:string, ...middleware):void;
    configure(fn:Function):Application;
    delete(path:string, ...middleware):void;
    get(path:string, ...middleware):any|void;
    head(path:string, ...middleware):void;
    init():void;
    listen(...arguments);
    patch(path:string, ...middleware):void;
    post(path:string, ...middleware):void;
    put(path:string, ...middleware):void;
    service<T>(location:string, service?:Service<T>, options?:{}):Service<T>;
    set(key:string, value:any):void;
    setup():Application;
    use(location:string, ...middleware):Application;
  }

  export interface Service<T> {
    create(data, params, callback?:(err:Error, data) => any):void|Promise<T>;
    find(params, callback?:(err:Error, data) => any):void|Promise<T>;
    get(id, params, callback?:(err:Error, data) => any):void|Promise<T>;
    patch(id, data, params, callback?:(err:Error, data) => any):void|Promise<T>;
    update(id, data, params, callback?:(err:Error, data) => any):void|Promise<T>;
    remove(id, params, callback?:(err:Error, data) => any):void|Promise<T>;
  }

  export default function createApplication(...args):Application;
}

declare module 'feathers/client' {
  export interface Application {
    authenticate(options:{}):Promise<AuthenticationResult>;
    configure(fn:Function):Application;
    get(path:string):any;
    service<T>(location:string, service?:Service<T>, options?:{}):Service<T>;
    set(key:string, value:any):void;
  }

  export interface AuthenticationResult {
    data:any;
    token:string;
  }

  export interface Service<T> {
    create(data, params, callback?:(err:Error, data) => any):void|Promise<T>;
    find(params, callback?:(err:Error, data) => any):void|Promise<T>;
    get(id, params, callback?:(err:Error, data) => any):void|Promise<T>;
    patch(id, data, params, callback?:(err:Error, data) => any):void|Promise<T>;
    update(id, data, params, callback?:(err:Error, data) => any):void|Promise<T>;
    remove(id, params, callback?:(err:Error, data) => any):void|Promise<T>;
  }

  export default function createApplication(...args):Application;
}
