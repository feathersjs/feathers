import socket from '../../src/socket';
import { expect } from 'chai';

describe('Feathers Socket Handlers', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../../lib/socket')).to.equal('object');
  });

  it('is ES6 compatible', () => {
    expect(typeof socket).to.equal('object');
  });

  it('exposes socketio handler function', () => {
    expect(typeof socket.socketio).to.equal('function');
  });

  it('exposes primus handler function', () => {
    expect(typeof socket.primus).to.equal('function');
  });
});
