'use strict';

// <%= name %>-model.js - A sequelize model
// 
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.

const Sequelize = require('sequelize');

module.exports = function(sequelize) {
  const <%= name %> = sequelize.define('<%= pluralizedName %>', {<% if(name === 'user') { %><% for (var i = 0; i < providers.length; i++) { %>
    <% if (providers[i] === 'local') { %>email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    }<% } else { %><%= providers[i].name %>Id: {
      type: Sequelize.STRING,
      allowNull: true
    },<% }%><% } %><% } else { %>
    text: {
      type: Sequelize.STRING,
      allowNull: false
    }<% } %>
  });

  <%= name %>.sync();

  return <%= name %>;
};
