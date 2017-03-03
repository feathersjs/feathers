import 'socket.io';

type FeatherSocketCallback =
  (io: any) => void;

type FeathersSockeOptions =
  SocketIO.ServerOptions |
  FeatherSocketCallback;


declare function feathersSocketIO(
    options?: FeathersSockeOptions,
    config?: FeathersSockeOptions
  ): () => void;

declare namespace feathersSocketIO {}

export = feathersSocketIO;
