'use strict';

// <%= name %>-model.js - A just a generic object literal model

const <%= name %>Model = {
  text: {type: String, required: true, index: true},
  createdAt: {type: Date, 'default': Date.now},
  updatedAt: {type: Date, 'default': Date.now}
};

module.exports = <%= name %>Model;
