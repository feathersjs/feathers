import getArguments from './arguments';
import * as socket from './sockets/index';
import { stripSlashes } from './utils';
import hooks from './hooks';

export default {
  socket,
  getArguments,
  stripSlashes,
  hooks
};
