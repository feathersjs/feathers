/// <reference types="@feathersjs/transport-commons"/>
import Http from 'http';
import SocketIO from 'socket.io';

declare module '@feathersjs/feathers' {
  interface Application<ServiceTypes = any> {
    listen (port: number): Http.Server;
  }
}

export default function feathersSocketIO (callback?: (io: SocketIO.Server) => void): () => void;
export default function feathersSocketIO (options: number | SocketIO.ServerOptions, callback?: (io: SocketIO.Server) => void): () => void;
export default function feathersSocketIO (port: number, options?: SocketIO.ServerOptions, callback?: (io: SocketIO.Server) => void): () => void;
