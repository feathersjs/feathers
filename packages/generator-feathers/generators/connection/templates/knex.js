const knex = require('knex');

module.exports = function () {
  const app = this;
  const { client, connection } = app.get('<%= database %>');
  const db = knex({ client, connection });

  app.set('knexClient', db);
};
