class Channel {
  constructor (connections = [], data = null) {
    this.connections = connections;
    this.data = data;
  }

  get length () {
    return this.connections.length;
  }

  leave (...connections) {
    connections.forEach(current => {
      if (typeof current === 'function') {
        return this.leave(...this.connections.filter(current));
      }

      const index = this.connections.indexOf(current);

      if (index !== -1) {
        this.connections.splice(index, 1);
      }
    });

    return this;
  }

  join (...connections) {
    connections.forEach(connection => {
      if (this.connections.indexOf(connection) === -1) {
        this.connections.push(connection);
      }
    });

    return this;
  }

  filter (fn) {
    return new Channel(this.connections.filter(fn), this.data);
  }

  send (data) {
    return new Channel(this.connections, data);
  }
}

module.exports = Channel;
