module.exports = function(app) {
  if(!app.channel) {
    // If no real-time functionality has been configured just return
    return;
  }

  app.on('connection', connection => {
    // On a new real-time connection, add it to the
    // anonymous channel
    app.channel('anonymous').join(connection);
  });

  app.on('login', (user, { connection }) => {
    // connection can be undefined if there is no
    // real-time connection, e.g. when logging in via REST
    if(connection) {
      // The connection is no longer anonymous, remove it
      app.channel('anonymous').leave(connection);

      // Add it to the authenticated user channel
      app.channel('authenticated').join(connection);

      // Channels can be named anything and joined on any condition 
      // E.g. to send real-time events only to admins use

      // if(user.isAdmin) { app.channel('admins').join(conneciton); }

      // If the user has joined e.g. chat rooms
      
      // user.rooms.forEach(room => app.channel(`rooms/${room.id}`).join(channel))
    }
  });
};
