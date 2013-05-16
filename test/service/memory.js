var assert = require('assert');
var MemoryService = require('../../lib/services/memory');
var Proto = require('uberproto');
var service;

describe('Memory Service', function () {
  beforeEach(function(done){
    service = Proto.create.call(MemoryService);
    service.create({
      id: 1,
      name: 'Test 1'
    }, function(error, data) {
      done();
    });
  });

  afterEach(function(done){
    service.destroy(1, function(err){
      done();
    });
  });

  describe('get', function () {
    it('should return an instance that exists', function (done){
      service.get(1, function(error, data) {
        assert.equal(data.id, 1);
        assert.equal(data.name, 'Test 1');
        done();
      });
    });

    it('should return an error when requested doesn\'t exist', function (done){
      service.get(2, function(error, data) {
        // assert.exists(error,);
        assert.equal(data, null);
        done();
      });
    });
  });

  describe('create', function () {
    it('should create a new instance', function (done) {
      service.create({
        id: 2,
        name: 'Test 2'
      }, function(error, data) {
        assert.equal(data.id, 2);
        assert.equal(data.name, 'Test 2');
        done();
      });
    });

    it('should return an error when it can\'t create');
  });

  describe('update', function () {
    it('should update an existing instance', function (done) {
      service.update(1, {
        name: 'Test 1 Updated'
      }, function(error, data) {
        assert.equal(data.id, 1);
        assert.equal(data.name, 'Test 1 Updated');
        done();
      });
    });

    it('should return an error on db when updated doesn\'t exist', function (done) {
      service.update(3, {
        name: 'Test 2'
      }, function(error, data) {
        // assert.equal(error, 1);
        assert.equal(data, null);
        done();
      });
    });
  });

  describe('destroy', function () {
    it('should delete an existing instance', function (done) {
      service.destroy(1, function(error, data) {
        assert.equal(data.id, 1);
        assert.equal(data.name, 'Test 1');
        done();
      });
    });

    it('should return an error on db when updated doesn\'t exist', function (done) {
      service.destroy(3, function(error, data) {
        // assert.equal(error, 1);
        assert.equal(data, null);
        done();
      });
    });
  });

  describe('find', function () {
    it('should return all items');
    it('should return all items sorted in ascending order');
    it('should return all items sorted in descending order');
    it('should return the number of items set by the limit');
    it('should skip over the number of items set by skip');
  });

  it('creates indexes and gets items', function (done) {
    var service = Proto.create.call(MemoryService);
    service.create({
      name: 'Test 1'
    }, {}, function() {
      service.create({
        name: 'Test 2'
      }, {}, function(error, data) {
        assert.equal(data.id, 1);
        assert.equal(data.name, 'Test 2');
        service.find({}, function(error, items) {
          assert.ok(Array.isArray(items));
          assert.equal(items.length, 2);
          service.get(0, {}, function(error, data) {
            assert.equal(data.id, 0);
            assert.equal(data.name, 'Test 1');
            done();
          });
        });
      });
    });
  });
});
