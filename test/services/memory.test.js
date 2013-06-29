var chai = require('chai');
var expect = chai.expect;
var MemoryService = require('../../lib/services/memory');
var Proto = require('uberproto');
var service;

describe('Memory Service', function () {
  beforeEach(function(done){
    service = Proto.create.call(MemoryService);
    service.on('error', function(){});
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
        expect(data.id).to.equal(1);
        expect(data.name).to.equal('Test 1');
        done();
      });
    });

    it('should return an error when requested instance doesn\'t exist', function (done){
      service.get(2, function(error, data) {
        expect(error).to.not.be.null;
        expect(data).to.be.undefined;
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
        expect(data.id).to.equal(2);
        expect(data.name).to.equal('Test 2');
        done();
      });
    });

    it('should return an error when it can\'t create', function (done) {
      service.create({
        id: 1,
        name: 'Test 2'
      }, function(error, data) {
        expect(error).to.not.be.null;
        expect(data).to.be.undefined;
        done();
      });
    });
  });

  describe('update', function () {

    it('should update an existing instance', function (done) {
      service.update(1, {
        name: 'Test 1 Updated'
      }, function(error, data) {
        expect(data.id).to.equal(1);
        expect(data.name).to.equal('Test 1 Updated');
        done();
      });
    });

    it('should return an error on db when instance to update doesn\'t exist', function (done) {
      service.update(3, {
        name: 'Test 2'
      }, function(error, data) {
        expect(error).to.not.be.null;
        expect(data).to.be.undefined;
        done();
      });
    });

  });

  describe('destroy', function () {

    it('should delete an existing instance', function (done) {
      service.destroy(1, function(error, data) {
        expect(data.id).to.equal(1);
        expect(data.name).to.equal('Test 1');
        done();
      });
    });

    it('should return an error on db when instance to delete doesn\'t exist', function (done) {
      service.destroy(3, function(error, data) {
        expect(error).to.not.be.null;
        expect(data).to.be.undefined;
        done();
      });
    });

  });

  describe('find', function () {

    beforeEach(function(done){
      service.create({
        id: 2,
        name: 'Bob'
      }, function(){
        service.create({
          id: 3,
          name: 'Alice'
        }, function(){
          done();
        });
      });
    });

    afterEach(function(done){
      service.destroy(2, function(){
        service.destroy(3, function(){
          done();
        });
      });
    });

    it('should return all items', function(done){
      var expected = [
        {
          id: 1,
          name: 'Test 1'
        },
        {
          id: 2,
          name: 'Bob'
        },
        {
          id: 3,
          name: 'Alice'
        }
      ];

      service.find({}, function(err, items){
        expect(err).to.be.null;
        expect(items).to.deep.equal(expected);
        done();
      });
    });

    it('should return all items sorted in ascending order by sort value', function(done){
      var expected = [
        {
          id: 3,
          name: 'Alice'
        },
        {
          id: 2,
          name: 'Bob'
        },
        {
          id: 1,
          name: 'Test 1'
        }
      ];

      service.find({ sort: 'name'}, function(err, items){
        expect(err).to.be.null;
        expect(items).to.deep.equal(expected);
        done();
      });
    });

    it('should return all items sorted in descending order by sort value', function(done){
      var expected = [
        {
          id: 1,
          name: 'Test 1'
        },
        {
          id: 2,
          name: 'Bob'
        },
        {
          id: 3,
          name: 'Alice'
        }
      ];

      service.find({ sort: 'name', order: true }, function(err, items){
        expect(err).to.be.null;
        expect(items).to.deep.equal(expected);
        done();
      });
    });

    it('should return the number of items set by the limit', function(done){
      var expected = [
        {
          id: 1,
          name: 'Test 1'
        },
        {
          id: 2,
          name: 'Bob'
        }
      ];

      service.find({ limit: 2 }, function(err, items){
        expect(err).to.be.null;
        expect(items).to.deep.equal(expected);
        done();
      });
    });

    it('should skip over the number of items set by skip', function(done){
      var expected = [
        {
          id: 3,
          name: 'Alice'
        }
      ];

      service.find({ skip: 2 }, function(err, items){
        expect(err).to.be.null;
        expect(items).to.deep.equal(expected);
        done();
      });
    });

  });
});
