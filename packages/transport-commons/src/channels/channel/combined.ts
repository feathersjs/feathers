import { Channel, RealTimeConnection } from './base';

function collectConnections (children: Channel[]) {
  const mappings = new WeakMap<RealTimeConnection, any>();
  const connections: RealTimeConnection[] = [];

  children.forEach(channel => {
    channel.connections.forEach(connection => {
      if (!mappings.has(connection)) {
        connections.push(connection);
        mappings.set(connection, channel.data);
      }
    });
  });

  return { connections, mappings };
}

export class CombinedChannel extends Channel {
  children: Channel[];
  mappings: WeakMap<RealTimeConnection, any>;

  constructor (children: Channel[], data: any = null) {
    const { mappings, connections } = collectConnections(children);

    super(connections, data);

    this.children = children;
    this.mappings = mappings;
  }

  refresh () {
    const collected = collectConnections(this.children);

    return Object.assign(this, collected);
  }

  leave (...connections: RealTimeConnection[]) {
    return this.callChildren('leave', connections);
  }

  join (...connections: RealTimeConnection[]) {
    return this.callChildren('join', connections);
  }

  dataFor (connection: RealTimeConnection) {
    return this.mappings.get(connection);
  }

  private callChildren (method: string, connections: RealTimeConnection[]) {
    // @ts-ignore
    this.children.forEach(child => child[method](...connections));
    this.refresh();

    return this;
  }
}
