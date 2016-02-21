'use strict';

// <%= name %>-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const <%= name %>Schema = new Schema({
  <% if(name === 'user') { %>email: {
    type: String,
    required: true,
    unique: true
  }, password: {
    type: String,
    required: true
  }<% } else { %>text: {
    type: String,
    required: true,
    index: true
  }<% } %>
});

const <%= name %>Model = mongoose.model('<%= name %>', <%= name %>Schema);

module.exports = <%= name %>Model;