
declare function feathersAuthClient(config?: feathersAuthClient.Config) : () => void;

declare namespace feathersAuthClient {
  export const defaults: Config;

  interface Config {
    storage?: Storage;
    header?: string;
    cookie?: string;
    storageKey?: string;
    jwtStrategy?: string;
    path?: string;
    entity?: string;
    service?: string;
  }

  interface Credentials {
    strategy?: string;
    accessToken?: string;
    type: string;
    [index: string]: any;
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

export = feathersAuthClient;
