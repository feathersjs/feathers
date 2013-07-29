var chai = require('chai');
var expect = chai.expect;
var MongoService = require('../../lib/services/mongodb');
var Proto = require('uberproto');
var service;
var _id;

// TODO (EK): Mock out mongodb or something so that we
// can actually run these tests on CI

describe('Mongo Service', function () {
  beforeEach(function(done){
    service = Proto.create.call(MongoService, {
      collection: 'test'
    });
    service.create({
      // _id: '51d2325334244ade98000001',
      name: 'Test 1'
    }, function(error, data) {
      _id = data[0]._id;
      done();
    });
  });

  afterEach(function(done){
    service.destroy(_id, function(err){
      done();
    });
  });

  describe('init', function () {
    it('should setup a mongo connection based on config');
    it('should setup a mongo connection based on ENV vars');
    it('should setup a mongo connection based on a connection string');
  });

  describe('index', function () {
    it('should return all items');
    it('should return all items sorted in ascending order');
    it('should return all items sorted in descending order');
    it('should return the number of items set by the limit');
    it('should skip over the number of items set by skip');
  });

  describe('get', function () {
    it('should return an instance that exists', function(done){
      service.get(_id, function(error, data) {

        expect(error).to.be.null;
        expect(data._id.toString()).to.equal(_id.toString());
        expect(data.name).to.equal('Test 1');
        done();
      });
    });

    it('should return an error on db error');
  });

  describe('create', function () {
    it('should create a single new instance', function(done){
      service.create({
        name: 'Test 2'
      }, function(error, data) {
        expect(error).to.be.null;
        expect(data).to.be.instanceof(Array);
        expect(data).to.not.be.empty;
        expect(data[0].name).to.equal('Test 2');
        done();
      });
    });

    it('should create multiple new instances', function(done){
      var items = [
        {
          name: 'Test 3'
        },
        {
          name: 'Test 4'
        }
      ];

      service.create(items, function(error, data) {
        expect(error).to.be.null;
        expect(data).to.be.instanceof(Array);
        expect(data).to.not.be.empty;
        expect(data[0].name).to.equal('Test 3');
        expect(data[1].name).to.equal('Test 4');
        done();
      });
    });

    it('should return an error on db error');
  });

  describe('update', function () {
    it('should update an existing instance');
    it('should return an error on db error');
  });

  describe('destroy', function () {
    it('should delete an existing instance');
    it('should return an error on db error');
  });
});
