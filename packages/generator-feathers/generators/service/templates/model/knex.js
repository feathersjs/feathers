/* eslint-disable no-console */

// <%= name %>-model.js - A KnexJS
// 
// See http://knexjs.org/
// for more of what you can do here.
module.exports = function (app) {
  const db = app.get('knexClient');

  db.schema.createTableIfNotExists('<%= kebabName %>', table => {
    table.increments('id');
    table.string('text');
  })
  .then(() => console.log('Updated <%= kebabName %> table'))
  .catch(e => console.error('Error updating <%= kebabName %> table', e));

  return db;
};
