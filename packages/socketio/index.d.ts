import 'socket.io';

type FeatherSocketCallback =
  (io: any) => void;

type FeathersSockeOptions =
  SocketIO.ServerOptions |
  FeatherSocketCallback;


declare function e(
    options: FeathersSockeOptions,
    config?: FeathersSockeOptions
  ): () => void;

export = e;
