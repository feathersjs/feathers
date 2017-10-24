const populateHeader = require('./populate-header');
const populateAccessToken = require('./populate-access-token');
const populateEntity = require('./populate-entity');

let hooks = {
  populateHeader,
  populateAccessToken,
  populateEntity
};

module.exports = hooks;
