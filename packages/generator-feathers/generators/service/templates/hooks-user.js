'use strict';

const { authenticate } = require('feathers-authentication').hooks;
const commonHooks = require('feathers-hooks-common');

<% if (authentication.strategies.indexOf('local') !== -1) { %>const { hashPassword } = require('feathers-authentication-local').hooks;<% } %>

module.exports = {
  before: {
    all: [],
    find: [ authenticate('jwt') ],
    get: [ authenticate('jwt') ],
    create: [ <% if (authentication.strategies.indexOf('local') !== -1) { %>hashPassword()<% } %> ],
    update: [ authenticate('jwt') ],
    patch: [ authenticate('jwt') ],
    remove: [ authenticate('jwt') ]
  },

  after: {
    all: [commonHooks.when(hook => hook.params.provider, commonHooks.discard('password'))],
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
