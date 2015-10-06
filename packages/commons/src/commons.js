import getArguments from './arguments';
import socket from './sockets/index';
import { stripSlashes } from './utils';
import hooks from './hooks';

export default {
  socket,
  getArguments,
  stripSlashes,
  hooks
};
