'use strict';

// <%= name %>-model.js - A sequelize model
// 
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.

const Sequelize = require('sequelize');

module.exports = function(sequelize) {
  const <%= name %> = sequelize.define('<%= name %>', {
    text: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isAlphanumeric: { msg: '`text` must only contain alpha numeric characters' }
      }
    }
  }, {
    freezeTableName: true
  });

  <%= name %>.sync({ force: true });

  return <%= name %>;
};
