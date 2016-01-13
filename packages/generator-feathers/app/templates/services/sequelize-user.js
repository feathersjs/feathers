import hooks from '../hooks';
import Sequelize from 'sequelize';
import service from 'feathers-sequelize';
import User from '../models/user';

export default function(){
  const app = this;
  <% if (database === 'sqlite') { %>
  const sequelize = new Sequelize('feathers', null, null, {
    dialect: 'sqlite',
    storage: app.get('sqlite'),
    logging: false
  });<% } else if (database === 'mssql') { %>
  const sequelize = new Sequelize('feathers', {
    dialect: '<%= database %>',
    host: 'localhost',
    port: 1433,
    logging: false,
    dialectOptions: {
      instanceName: 'feathers'
    }
  });<% } else if (database) { %>
  const sequelize = new Sequelize(app.get('<%= database %>'), {
    dialect: '<%= database %>',
    logging: false
  });
  <% } %>
  
  let options = {
    Model: User(sequelize),
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