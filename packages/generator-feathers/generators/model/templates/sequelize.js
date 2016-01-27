// <%= name %>.js - A sequelize model
// 
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.

import Sequelize from 'sequelize';

export default function(sequelize) {
  let <%= name %> = sequelize.define('<%= name %>', {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isAlpha: { msg: '`name` must only contain characters' }
      }
    }
  }, {
    freezeTableName: true
  });

  <%= name %>.sync({ force: true });

  return <%= name %>;
}