import 'socket.io-client';

declare const socketioClient: FeathersSocketIOClient;
export = socketioClient;

interface FeathersSocketIOClient {
    (socket: SocketIOClient.Socket, options?: socketioClient.Options): () => void;
    default: FeathersSocketIOClient;
}

declare namespace socketioClient {
    interface Options {
        timeout?: number;
    }
}
