import hooks from '../hooks';
import service from 'feathers-sequelize';
import <%= name %> from '../models/<%= name %>';

export default function(){
  const app = this;

  let options = {
    Model: <%= name %>(app.get('sequelize')),
    paginate: {
      default: 5,
      max: 25
    }
  };

  app.use(<% if (version) { %>'/<%= version %>/<%= pluralizedName %>'<% } else { %>'/<%= pluralizedName %>'<% } %>, service(options));

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