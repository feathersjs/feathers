import { join } from 'path';
import NeDB from 'nedb';
import service from 'feathers-nedb';
import hooks from './hooks';

export default function(){
  const app = this;

  const db = new NeDB({
    filename: join(app.get('nedb'), '<%= pluralizedName %>.db'),
    autoload: true
  });

  let options = {
    Model: db,
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/<%= pluralizedName %>', service(options));

  // Get our initialize service to that we can bind hooks
  const <%= name %>Service = app.service('/<%= pluralizedName %>');

  // Set up our before hooks
  <%= name %>Service.before(hooks.before);

  // Set up our after hooks
  <%= name %>Service.after(hooks.after);
}
