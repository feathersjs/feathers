const ExpressCassandra = require('express-cassandra');
const FeathersCassandra = require('feathers-cassandra');

module.exports = function (app) {
  const connectionInfo = app.get('<%= database %>');
  const models = ExpressCassandra.createClient(connectionInfo);
  const cassandraClient = models.orm.get_system_client();

  app.set('models', models);

  cassandraClient.connect(err => {
    if (err) throw err;

    const cassanknex = require('cassanknex')({ connection: cassandraClient });

    FeathersCassandra.cassanknex(cassanknex);

    cassanknex.on('ready', err => {
      if (err) throw err;
    });

    app.set('cassanknex', cassanknex);
  });
};
