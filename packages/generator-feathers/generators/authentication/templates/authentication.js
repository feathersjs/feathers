const authentication = require('feathers-authentication');
const jwt = require('feathers-authentication-jwt');
<% if(strategies.indexOf('local') !== -1) { %>const local = require('feathers-authentication-local');<% } %>
<% if(oauthProviders.length){ %>const oauth2 = require('feathers-authentication-oauth2');<% } %>
<% oauthProviders.forEach(provider => { %>const <%= provider.strategyName %> = require('<%= provider.module %>');
<% }); %>
module.exports = function () {
  const app = this;
  const config = app.get('authentication');

  // Set up authentication with the secret
  app.configure(authentication(config));
  app.configure(jwt(config.jwt));<% if(strategies.indexOf('local') !== -1) { %>
  app.configure(local(config.local));<% } %>
<% oauthProviders.forEach(provider => { %>
  app.configure(oauth2(Object.assign({
    name: '<%= provider.name %>',
    Strategy: <%= provider.strategyName %>
  }, config.<%= provider.name %>)));
<% }); %>
  // The `authentication` service is used to create a JWT.
  // The before `create` hook registers strategies that can be used
  // to create a new valid JWT (e.g. local or oauth2)
  app.service('authentication').hooks({
    before: {
      create: [
        authentication.hooks.authenticate(config.strategies)
      ],
      remove: [
        authentication.hooks.authenticate('jwt')
      ]
    }
  });
};
