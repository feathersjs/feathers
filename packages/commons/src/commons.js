import getArguments from './arguments';
import socket from './sockets/';
import { stripSlashes } from './utils';
import hooks from './hooks';

export default {
  socket,
  getArguments,
  stripSlashes,
  hooks
};
