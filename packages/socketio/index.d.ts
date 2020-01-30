import http from 'http';
import io from 'socket.io';

declare const socketio: FeathersSocketIO;
export = socketio;

interface FeathersSocketIO {
  (callback?: (io: io.Server) => void): (app: any) => void;
  (options: number | io.ServerOptions, callback?: (io: io.Server) => void): (app: any) => void;
  (port: number, options?: io.ServerOptions, callback?: (io: io.Server) => void): (app: any) => void;
  default: FeathersSocketIO;
}
