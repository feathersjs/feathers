// See https://vincit.github.io/objection.js/#models
// for more of what you can do here.
const { Model } = require('objection');

class <%= camelName %> extends Model {

  static get tableName() {
    return '<%= snakeName %>';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['password'],

      properties: {
      <% if(authentication.strategies.indexOf('local') !== -1) { %>
        email: { type: ['string', 'null'] },
        password: 'string',
      <% } %><% authentication.oauthProviders.forEach(provider => { %>
        <%= provider.name %>Id: { type: 'string' },
      <% }); %>
      }
    };
  }

  $beforeInsert() {
    this.createdAt = this.updatedAt = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = function (app) {
  const db = app.get('knex');

  db.schema.hasTable('<%= snakeName %>').then(exists => {
    if (!exists) {
      db.schema.createTable('<%= snakeName %>', table => {
        table.increments('id');
      <% if(authentication.strategies.indexOf('local') !== -1) { %>
        table.string('email').unique();
        table.string('password');
      <% } %>
      <% authentication.oauthProviders.forEach(provider => { %>
        table.string('<%= provider.name %>Id');
      <% }); %>
        table.timestamp('createdAt');
        table.timestamp('updatedAt');
      })
        .then(() => console.log('Created <%= snakeName %> table')) // eslint-disable-line no-console
        .catch(e => console.error('Error creating <%= snakeName %> table', e)); // eslint-disable-line no-console
    }
  })
    .catch(e => console.error('Error creating <%= snakeName %> table', e)); // eslint-disable-line no-console

  return <%= camelName %>;
};
