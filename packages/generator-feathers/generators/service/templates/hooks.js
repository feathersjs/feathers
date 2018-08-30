<% if (requiresAuth) { %>const { authenticate } = require('@feathersjs/authentication').hooks;<% } %>

module.exports = {
  before: {
    all: [<% if (requiresAuth) { %> authenticate('jwt') <% } %>],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
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
