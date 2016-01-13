import Sequelize from 'sequelize';

export default function(sequelize) {
  let User = sequelize.define('user', {
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: 'Must provide a valid email' }
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    freezeTableName: true
  });

  User.sync({ force: true });

  return User;
}