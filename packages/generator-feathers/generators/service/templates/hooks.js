'use strict';

const globalHooks = require('../../../hooks');
<% if (authentication) { %>const auth = require('feathers-authentication').hooks;<% } %>

exports.before = {
  all: [<% if (authentication && name !== 'user') { %>
    auth.verifyToken(),
    auth.populateUser(),
    auth.requireAuth()
  <% } %>],
  find: [<% if (authentication && name === 'user') { %>
    auth.verifyToken(),
    auth.populateUser(),
    auth.requireAuth()
  <% } %>],
  get: [<% if (authentication && name === 'user') { %>
    auth.verifyToken(),
    auth.populateUser(),
    auth.requireAuth()
  <% } %>],
  create: [<% if (authentication && name === 'user') { %>
    auth.hashPassword()
  <% } %>],
  update: [<% if (authentication && name === 'user') { %>
    auth.verifyToken(),
    auth.populateUser(),
    auth.requireAuth()
  <% } %>],
  patch: [<% if (authentication && name === 'user') { %>
    auth.verifyToken(),
    auth.populateUser(),
    auth.requireAuth()
  <% } %>],
  remove: [<% if (authentication && name === 'user') { %>
    auth.verifyToken(),
    auth.populateUser(),
    auth.requireAuth()
  <% } %>]
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
