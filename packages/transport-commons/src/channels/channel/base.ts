import { EventEmitter } from 'events';

export interface RealTimeConnection {
  [key: string]: any;
}

export class Channel extends EventEmitter {
  connections: RealTimeConnection[];
  data: any;

  constructor (connections: RealTimeConnection[] = [], data: any = null) {
    super();

    this.connections = connections;
    this.data = data;
  }

  get length () {
    return this.connections.length;
  }

  leave (...connections: RealTimeConnection[]) {
    connections.forEach(current => {
      if (typeof current === 'function') {
        const callback = current as (connection: RealTimeConnection) => boolean;

        this.leave(...this.connections.filter(callback));
      } else {
        const index = this.connections.indexOf(current);

        if (index !== -1) {
          this.connections.splice(index, 1);
        }
      }
    });

    if (this.length === 0) {
      this.emit('empty');
    }

    return this;
  }

  join (...connections: RealTimeConnection[]) {
    connections.forEach(connection => {
      if (this.connections.indexOf(connection) === -1) {
        this.connections.push(connection);
      }
    });

    return this;
  }

  filter (fn: (connection: RealTimeConnection) => boolean) {
    return new Channel(this.connections.filter(fn), this.data);
  }

  send (data: any) {
    return new Channel(this.connections, data);
  }
}
