var chai = require('chai');
var expect = chai.expect;
var DatabaseCleaner = require('database-cleaner');
var databaseCleaner = new DatabaseCleaner('mongodb');
var mongo = require('mongoskin');
var db = mongo.db('localhost:27017/feathers');
var Proto = require('uberproto');

var MongoService = require('../../lib/services/mongodb');
var service = Proto.create.call(MongoService, {
  collection: 'test'
});
var _ids = {};

// TODO (EK): Mock out mongodb or something so that we
// can actually run these tests on CI

function clean(done){
  databaseCleaner.clean(db, function() {
    console.log('db cleaned');
    db.close();
    done();
  });
}

describe('Mongo Service', function () {
  before(clean);
  after(clean);

  beforeEach(function(done){
    service.create({
      name: 'Doug',
      age: 32
    }, function(error, data) {
      _ids.Doug = data[0]._id;
      done();
    });
  });

  afterEach(function(done){
    service.destroy(_ids.Doug, function(err){
      done();
    });
  });

  describe('init', function () {
    it('should setup a mongo connection based on config');
    it('should setup a mongo connection based on ENV vars');
    it('should setup a mongo connection based on a connection string');
  });

  describe('find', function () {
    beforeEach(function(done){
      service.create({
        name: 'Bob',
        age: 25
      }, function(err, bob){

        _ids.Bob = bob._id;

        service.create({
          name: 'Alice',
          age: 19
        }, function(err, alice){

          _ids.Alice = alice._id;

          done();
        });
      });
    });

    afterEach(function(done){
      service.destroy(_ids.Bob, function(){
        service.destroy(_ids.Alice, function(){
          done();
        });
      });
    });

    it('should return all items', function(done){
      service.find({}, function(error, data) {

        expect(error).to.be.null;
        expect(data).to.be.instanceof(Array);
        expect(data.length).to.equal(3);
        done();
      });
    });

    it('should return an item by id', function(done){
      service.find({ id: _ids.Doug }, function(error, data) {

        expect(error).to.be.null;
        expect(data.name).to.equal('Doug');
        done();
      });
    });

    it('should return all items sorted in ascending order');
    it('should return all items sorted in descending order');
    it('should return the number of items set by the limit', function(error, data){

      service.find({ query: { limit: 2 } }, function(error, data) {

        expect(error).to.be.null;
        expect(data.length).to.equal(2);
        done();
      });
    });
    it('should skip over the number of items set by skip');
  });

  describe('get', function () {
    it('should return an instance that exists', function(done){
      service.get(_ids.Doug, function(error, data) {

        expect(error).to.be.null;
        expect(data._id.toString()).to.equal(_ids.Doug.toString());
        expect(data.name).to.equal('Doug');
        done();
      });
    });

    it('should return an error when no id is provided', function(done){
      service.get(function(error, data) {

        expect(error).to.be.ok;
        expect(data).to.be.undefined;
        done();
      });
    });

    it('should return an error on db error');
  });

  describe('create', function () {
    it('should create a single new instance', function(done){
      service.create({
        name: 'Bill'
      }, function(error, data) {
        expect(error).to.be.null;
        expect(data).to.be.instanceof(Array);
        expect(data).to.not.be.empty;
        expect(data[0].name).to.equal('Bill');
        done();
      });
    });

    it('should create multiple new instances', function(done){
      var items = [
        {
          name: 'Gerald'
        },
        {
          name: 'Herald'
        }
      ];

      service.create(items, function(error, data) {
        expect(error).to.be.null;
        expect(data).to.be.instanceof(Array);
        expect(data).to.not.be.empty;
        expect(data[0].name).to.equal('Gerald');
        expect(data[1].name).to.equal('Herald');
        done();
      });
    });

    it('should return an error on db error');
  });

  describe('update', function () {
    it('should update an existing instance', function(done){
      service.update(_ids.Doug, { name: 'Doug', age: 12 }, function(error, data) {
        expect(error).to.be.null;
        expect(data).to.be.ok;

        service.get(_ids.Doug, function(error, data){
          expect(data.name).to.equal('Doug');
          expect(data.age).to.equal(12);
          done();
        });
      });
    });
    it('should update multiple existing instances');
    it('should return an error on db error');
  });

  describe('destroy', function () {
    it('should delete an existing instance', function(done){
      service.destroy(_ids.Doug, function(error, data) {
        expect(error).to.be.null;
        expect(data).to.be.ok;
        done();
      });
    });

    it('should delete multiple existing instances');
    it('should return an error on db error');
  });
});
