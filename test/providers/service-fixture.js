'use strict';

var _ = require('lodash');
var assert = require('assert');

var findAllData = [{
  id: 0,
  description: 'You have to do something',
  tasks: [{
    id: 0,
    description: 'play a video game'
  }, {
    id: 1,
    description: 'watch a movie'
  }]
}, {
  id: 1,
  description: 'You have to do laundry',
  tasks: [{
    id: 0,
    description: 'the blue jean'
  }, {
    id: 1,
    description: 'the red shirt'
  }]
}];

exports.Service = {
  events: [ 'log' ],

  find: function (params, callback) {
    callback(null, findAllData);
  },

  get: function (name, params, callback) {
    callback(null, {
      id: name,
      description: "You have to do " + name + "!"
    });
  },

  create: function (data, params, callback) {
    var result = _.clone(data);
    result.id = 42;
    result.status = 'created';
    callback(null, result);
  },

  update: function (id, data, params, callback) {
    var result = _.clone(data);
    result.id = id;
    result.status = 'updated';
    callback(null, result);
  },

  patch: function (id, data, params, callback) {
    var result = _.clone(data);
    result.id = id;
    result.status = 'patched';
    callback(null, result);
  },

  remove: function (id, params, callback) {
    callback(null, {
      id: id
    });
  },

  findInCollection: function(id, collection, params, callback) {
    var collectionData = findAllData[id].tasks;
    callback(null, collectionData);
  },

  // POST /resource/:id/:collection/:documentId
  addToCollection: function(id, collection, params, callback) {


    var result = _.clone(data);
    result.id = 42;
    result.status = 'created';
    callback(null, result);

  }
  //
  //// GET /resource/:id/:collection/:documentId
  //getInCollection: function(id, collection, documentId, params, callback) {
  //
  //},
  //
  //// DELETE /resource/:id/:collection/:documentId
  //removeFromCollection: function(id, collection, documentId, params, callback) {
  //
  //}
};

exports.verify = {
  find: function (data) {
    assert.deepEqual(findAllData, data, 'Data as expected');
  },

  get: function (id, data) {
    assert.equal(data.id, id, 'Got id in data');
    assert.equal(data.description, 'You have to do ' + id + '!', 'Got description');
  },

  create: function (original, current) {
    var expected = _.extend({}, original, {
      id: 42,
      status: 'created'
    });
    assert.deepEqual(expected, current, 'Data ran through .create as expected');
  },

  update: function (id, original, current) {
    var expected = _.extend({}, original, {
      id: id,
      status: 'updated'
    });
    assert.deepEqual(expected, current, 'Data ran through .update as expected');
  },

  patch: function (id, original, current) {
    var expected = _.extend({}, original, {
      id: id,
      status: 'patched'
    });
    assert.deepEqual(expected, current, 'Data ran through .patch as expected');
  },

  remove: function (id, data) {
    assert.deepEqual({
      id: id
    }, data, '.remove called');
  },

  findInCollection: function(id, currentData) {
    var expectedData = findAllData[id].tasks;
    assert.deepEqual(expectedData, currentData, 'Data as expected');
  },

  // POST /resource/:id/:collection/:documentId
  addToCollection: function(id, collection, params, callback) {

  },
  //
  //// GET /resource/:id/:collection/:documentId
  //getInCollection: function(id, collection, documentId, params, callback) {
  //
  //},
  //
  //// DELETE /resource/:id/:collection/:documentId
  //removeFromCollection: function(id, collection, documentId, params, callback) {
  //
  //}
};
