const { Model } = require('objection');

module.exports = function (app) {
  const { client, connection } = app.get('<%= database %>');
  const knex = require('knex')({ client, connection, useNullAsDefault: false });

  Model.knex(knex);

  app.set('knex', knex);
};
