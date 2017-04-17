const { authenticate } = require('feathers-authentication').hooks;
const commonHooks = require('feathers-hooks-common');
const { restrictToOwner } = require('feathers-authentication-hooks');

<% if (authentication.strategies.indexOf('local') !== -1) { %>const { hashPassword } = require('feathers-authentication-local').hooks;<% } %>
const restrict = [
  authenticate('jwt'),
  restrictToOwner({
    idField: '<%= (adapter === 'mongodb' || adapter === 'mongoose' || adapter === 'nedb') ? '_id' : 'id' %>',
    ownerField: '<%= (adapter === 'mongodb' || adapter === 'mongoose' || adapter === 'nedb') ? '_id' : 'id' %>'
  })
];

module.exports = {
  before: {
    all: [],
    find: [ authenticate('jwt') ],
    get: [ ...restrict ],
    create: [ <% if (authentication.strategies.indexOf('local') !== -1) { %>hashPassword()<% } %> ],
    update: [ ...restrict<% if (authentication.strategies.indexOf('local') !== -1) { %>, hashPassword()<% } %> ],
    patch: [ ...restrict<% if (authentication.strategies.indexOf('local') !== -1) { %>, hashPassword()<% } %> ],
    remove: [ ...restrict ]
  },

  after: {
    all: [
      commonHooks.when(
        hook => hook.params.provider,
        commonHooks.discard('password')
      )
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
