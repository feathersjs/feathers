'use strict';

// <%= name %>-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const <%= name %>Schema = new Schema({<% if(name === 'user') { %><% for (var i = 0; i < providers.length; i++) { %>
  <% if (providers[i] === 'local') { %>email: {type: String, required: true, unique: true},
  password: { type: String, required: true },
  <% } else { %><%= providers[i].name %>Id: { type: String },
  <%= providers[i].name %>: { type: Schema.Types.Mixed },<% }%><% } %><% } else { %>
  text: { type: String, required: true },<% } %>
  createdAt: { type: Date, 'default': Date.now },
  updatedAt: { type: Date, 'default': Date.now }
});

const <%= name %>Model = mongoose.model('<%= name %>', <%= name %>Schema);

module.exports = <%= name %>Model;