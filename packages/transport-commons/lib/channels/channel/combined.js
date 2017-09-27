const Channel = require('./base');

function collectConnections (children) {
  const mappings = new WeakMap();
  const connections = [];

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

class CombinedChannel extends Channel {
  constructor (children, data = null) {
    const { mappings, connections } = collectConnections(children);

    super(connections, data);

    this.children = children;
    this.mappings = mappings;
  }

  refresh () {
    const collected = collectConnections(this.children);

    return Object.assign(this, collected);
  }

  _callChildren (method, connections) {
    this.children.forEach(child => child[method](...connections));
    this.refresh();

    return this;
  }

  leave (...connections) {
    return this._callChildren('leave', connections);
  }

  join (...connections) {
    return this._callChildren('join', connections);
  }

  dataFor (connection) {
    return this.mappings.get(connection);
  }
}

module.exports = CombinedChannel;
