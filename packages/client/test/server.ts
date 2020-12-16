import socketio from '@feathersjs/socketio';
import createApp from './fixture';

const app = createApp(function () {
  this.configure(socketio());
});

export default app.listen(3000);
