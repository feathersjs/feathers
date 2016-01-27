import <%= name %> from './models/<%= name %>';
import service from 'feathers-mongoose';
import hooks from './hooks';

export default function(){
  const app = this;

  let options = {
    Model: <%= name %>,
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
