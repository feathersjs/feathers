// <%= name %>-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const <%= camelName %> = new mongooseClient.Schema({
  <% if(authentication.strategies.indexOf('local') !== -1) { %>
    email: {type: String, unique: true},
    password: { type: String },
  <% } %>
  <% authentication.oauthProviders.forEach(provider => { %>
    <%= provider.name %>Id: { type: String },
  <% }); %>
  }, {
    timestamps: true
  });

  return mongooseClient.model('<%= camelName %>', <%= camelName %>);
};
