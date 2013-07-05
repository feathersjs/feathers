var assert = require('assert');
var MongoService = require('../../lib/services/mongodb');
var Proto = require('uberproto');

describe('Mongo Service', function () {
  describe('get', function () {
    it('should return an instance that exists');
    it('should return an error on db error');
  });

  describe('create', function () {
    it('should create a new instance');
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

  describe('init', function () {
    it('should setup a mongo connection based on config');
    it('should setup a mongo connection based on ENV vars');
  });

  describe('index', function () {
    it('should return all items');
    it('should return all items sorted in ascending order');
    it('should return all items sorted in descending order');
    it('should return the number of items set by the limit');
    it('should skip over the number of items set by skip');
  });
});
