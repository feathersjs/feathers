
declare function e(config?: e.Config) : () => void;

declare namespace e {
  export const defaults: Config;

  interface Config {
    storage?:any;
    header?: 'authorization';
    cookie?: 'feathers-jwt';
    storageKey?: 'feathers-jwt';
    jwtStrategy?: 'jwt';
    path?: '/authentication';
    entity?: 'user';
    service?: 'users';
  }

  interface DataCredential{
    [index: string]: string;
  }

  interface Credentials extends DataCredential{
    strategy?:any;
    accessToken?: string;
    type: 'local' | 'token' | string;
  }

  class Passport {
    constructor(app: any, options: Config);
    setupSocketListeners(): void;
    connected(): Promise<any>;
    authenticate(credentials?: Credentials): any;
    authenticateSocket(credentials: Credentials, socket: any, emit: any): any;
    logoutSocket(socket: any, emit: any): any;
    logout(): Promise<any>;
    setJWT(data: any): Promise<any>;
    getJWT(): Promise<any>;
    verifyJWT(token: string): Promise<string>;
    payloadIsValid(payload: string): boolean;
    getCookie(name: string): string;
    clearCookie(name: string): null;
    getStorage(storage: any): any;
  }
}

export = e;
