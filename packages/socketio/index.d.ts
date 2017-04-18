import 'socket.io';

type FeatherSocketCallback =
  (io: any) => void;

type FeathersSockeOptions =
  number |
  SocketIO.ServerOptions |
  FeatherSocketCallback;


declare function feathersSocketIO(
    port?: FeathersSockeOptions,
    options?: FeathersSockeOptions,
    config?: FeathersSockeOptions
  ): () => void;

declare namespace feathersSocketIO {}

export = feathersSocketIO;
