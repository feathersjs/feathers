'use strict';

// <%= name %>-model.js - A sequelize model
// 
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.

const Sequelize = require('sequelize');

module.exports = function(sequelize) {
  const <%= name %> = sequelize.define('<%= name %>', {
    <% if(name === 'user') { %>email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    }, password: {
      type: Sequelize.STRING,
      allowNull: false
    }<% } else { %>text: {
      type: Sequelize.STRING,
      allowNull: false
    }<% } %>
  }, {
    freezeTableName: true
  });

  <%= name %>.sync({ force: true });

  return <%= name %>;
};
