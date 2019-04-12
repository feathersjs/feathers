// Primus removed its typings from the repo
// https://github.com/primus/primus/pull/623, as of 01/2018 there are none on
// DefinitelyTyped.

declare const primusClient: FeathersPrimusClient;
export = primusClient;

interface FeathersPrimusClient {
    (socket: any, options?: primusClient.Options): () => void;
    default: FeathersPrimusClient;
}

declare namespace primusClient {
    interface Options {
        timeout?: number;
    }
}
