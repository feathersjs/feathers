var init = require('./base');

function socketio(socket) {
  if(typeof window !== 'undefined' && window.io && typeof socket === 'string'){
    socket = window.io(socket);
  }

  return init(socket);
}

socketio.Service = init.Service;

module.exports = {
  socketio: socketio,
  primus: init
};
