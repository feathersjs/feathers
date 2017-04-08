'use strict';

const url = require('url');
const Sequelize = require('sequelize');

module.exports = function () {
  const app = this;
  const connectionString = app.get('mssql');
  const connection = url.parse(connectionString);
  const database = connection.path.substring(1, connection.path.length);
  const { port, hostname, username, password } = connection;
  const sequelize = new Sequelize(database, username, password, {
    dialect: 'mssql',
    host: hostname,
    logging: false,
    define: {
      freezeTableName: true
    },
    dialectOptions: {
      port,
      instanceName: 'NameOfTheMSSQLInstance'
    }
  });

  const oldSetup = app.setup;

  app.set('mssqlClient', sequelize);

  app.setup = function (...args) {
    const result = oldSetup.apply(this, args);

    // Set up data relationships
    const models = sequelize.models;
    Object.keys(models).forEach(name => {
      if ('associate' in models[name]) {
        models[name].associate(models);
      }
    });

    // Sync to the database
    sequelize.sync();

    return result;
  };
};
