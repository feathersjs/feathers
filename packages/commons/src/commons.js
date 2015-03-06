import { getArguments } from './arguments';
import socket from './sockets/index';

export default {
  socket,
  getArguments,
  stripSlashes(name) {
    return name.replace(/^(\/*)|(\/*)$/g, '');
  }
};
