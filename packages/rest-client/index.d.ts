// todo: get rid of all the anys

declare const restClient: FeathersRestClient;
export = restClient;

interface FeathersRestClient {
    (base?: string): restClient.Transport;
    default: FeathersRestClient;
}

declare namespace restClient {
    interface HandlerResult extends Function {
        /**
         * initialize service
         */
        (): void;

        /**
         * Transport Service
         */
        Service: any;

        /**
         * default Service
         */
        service: any;
    }

    type Handler = (connection: any, options?: any) => () => HandlerResult;

    interface Transport {
        jquery: Handler;
        superagent: Handler;
        request: Handler;
        fetch: Handler;
        axios: Handler;
        angular: Handler;
        angularHttpClient: Handler;
    }
}
