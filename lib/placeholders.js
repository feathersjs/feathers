const Proto = require('uberproto');

module.exports = function () {
  // Configure placeholders for channel and publishing functionality
  // that throws an error message if you try to use it but no real-time
  // transport has been registered
  return function (app) {
    Proto.mixin({
      channel () {
        throw new Error('app.channel: Channels are only available on a server with a registered real-time transport');
      },

      publish () {
        throw new Error('app.publish: Event publishing is only available on a server with a registered real-time transport');
      }
    }, app);

    app.mixins.push(service => {
      service.mixin({
        publish () {
          throw new Error('service.publish: Event publishing is only available on a server with a registered real-time transport');
        }
      });
    });
  };
};
