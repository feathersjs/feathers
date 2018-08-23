// @feathersjs/configuration pulls in default and <env> settings files using
// Node's `require()`.
// Node require() looks first for <filename>.js,
// and if not found, it will check for <filename>.json
//
// This configuration file has `.js` suffix, and must provide
// a `module.exports` containing the configuration properties.

var derivedSetting = 'Hello World';
var derivedEnvironment = 'NODE_ENV';

module.exports = {
  from: 'testing',
  testEnvironment: 'NODE_ENV',
  derived: derivedSetting,
  derivedEnvironment: derivedEnvironment,
  deep: { merge: true }
};
