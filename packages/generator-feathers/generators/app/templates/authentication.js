'use strict';

const authentication = require('feathers-authentication');
<% for (var i = 0; i < authentication.length; i++) { %>
const <%= S(authentication[i].name).capitalize().s %>Strategy = require('<%= authentication[i].strategy %>').Strategy;<% if (authentication[i].tokenStrategy) { %>
const <%= S(authentication[i].name).capitalize().s %>TokenStrategy = require('<%= authentication[i].tokenStrategy %>')<% if (authentication[i].tokenStrategyExposedNormally) { %>.Strategy<% } %>;<% }} %>

module.exports = function() {
  const app = this;

  let config = app.get('auth');
  <% for (var i = 0; i < authentication.length; i++) { %>
  config.<%= authentication[i].name %>.strategy = <%= S(authentication[i].name).capitalize().s %>Strategy;<% if (authentication[i].tokenStrategy) { %>
  config.<%= authentication[i].name %>.tokenStrategy = <%= S(authentication[i].name).capitalize().s %>TokenStrategy;<% }} %>

  <% if(authentication.length) { %>app.set('auth', config);<% } %>
  app.configure(authentication(config));
}
