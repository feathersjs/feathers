// Primus removed its typings from the repo
// https://github.com/primus/primus/pull/623, as of 01/2018 there are none on
// DefinitelyTyped.

declare const configurePrimus: FeathersPrimus;
export = configurePrimus;

interface FeathersPrimus {
  (options: any, callback?: (primus: any) => void): () => void;
  readonly SOCKET_KEY: unique symbol;
  default: FeathersPrimus;
}
