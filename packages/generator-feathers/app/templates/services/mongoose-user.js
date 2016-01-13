import hooks from '../hooks';
import mongoose from 'mongoose';
import service from 'feathers-mongoose';
import User from '../models/user';

mongoose.Promise = global.Promise;

export default function(){
  const app = this;
  
  mongoose.connect(app.get('mongodb'));

  let options = {
    Model: User,
    paginate: {
      default: 5,
      max: 25
    }
  };

  app.use('/v1/users', service(options));

  // const service = this.service('v1/users');

  /* * * Before hooks * * */
  // service.before({
  //   all:   [hooks.requireAuthForPrivate()],
  //   before: [hooks.setUserID()]
  // });

  // /* * * After hooks * * */
  // service.after({
  //   all: [hooks.removeSomeField()]
  // });

  // /* * * Set up event filters * * */
  // service.created = service.updated = service.patched = service.removed = events.requireAuthForPrivate;
}