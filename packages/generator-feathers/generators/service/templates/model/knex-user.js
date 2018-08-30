/* eslint-disable no-console */

// <%= name %>-model.js - A KnexJS
// 
// See http://knexjs.org/
// for more of what you can do here.
module.exports = function (app) {
  const db = app.get('knexClient');
  const tableName = '<%= snakeName %>'
  db.schema.hasTable(tableName).then(exists => {
    if(!exists) {
      db.schema.createTable(tableName, table => {
        table.increments('id');
      <% if(authentication.strategies.indexOf('local') !== -1) { %>
        table.string('email').unique();
        table.string('password');
      <% } %>
      <% authentication.oauthProviders.forEach(provider => { %>
        table.string('<%= provider.name %>Id');
      <% }); %>
      })
        .then(() => console.log(`Created ${tableName} table`))
        .catch(e => console.error(`Error creating ${tableName} table`, e));
    }
  });

  return db;
};
