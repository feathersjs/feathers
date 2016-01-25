import assert from 'assert';
import feathers from 'feathers';
import feathersHooks from 'feathers-hooks';
import feathersAuth from '../src/index';
import memory from 'feathers-memory';
import {hooks} from '../src/index';

console.log(require('../lib/index'));

const app = feathers();

app.configure(feathersHooks())
  .configure(feathersAuth({
    secret: 'feathers-rocks'
  }));

// A hook that simulates a logged-in user.
let setUser = function(){
  return function(hook){
    hook.params.user = {
      username: 'steinway',
      _id: 0,
      id: 0
    };
  };
};


describe('Auth hooks', () => {
  it('are available at module.hooks', () => {
    assert.equal(typeof require('../lib/index').hooks, 'object');
  });
});

describe('The hashPassword() hook', () => {
  it('is found at module.hooks.hashPassword', () => {
    assert.equal(typeof require('../lib/index').hooks.hashPassword, 'function');
  });

  it('hashes passwords at default location "password"', (done) => {
    app.use('todos', memory());
    const todos = app.service('todos');
    todos.before({
      create: [hooks.hashPassword()]
    });

    todos.create({username: 'bosendorfer', password: 'feathers'}, function(err, data){
      assert.notEqual(data.password, 'feathers');
      done();
    });
  });

  it('hashes passwords at custom location "pwd"', (done) => {
    app.use('todos', memory());
    const todos = app.service('todos');
    todos.before({
      create: [hooks.hashPassword('pwd')]
    });

    todos.create({username: 'bosendorfer', pwd: 'feathers'}, function(err, data){
      assert.notEqual(data.pwd, 'feathers');
      done();
    });
  });
});


describe('The queryWithUserId() hook', () => {
  it('is found at module.hooks.queryWithUserId', () => {
    assert.equal(typeof require('../lib/index').hooks.queryWithUserId, 'function');
  });

  it('adds the user\'s _id at the default location "userId"', (done) => {
    app.use('todos', memory({idField: '_id'}));
    const todos = app.service('todos');

    let setUser = function(){
      return function(hook){
        hook.params.user = {
          username: 'steinway',
          _id: 0
        };
      };
    };

    let customHook = function(){
      return function(hook){
        assert.equal(hook.params.query.userId, 0, 'The userId was added to the query params.');
      };
    };

    todos.before({
      find: [setUser(), hooks.queryWithUserId(), customHook()]
    });

    todos.create({username: 'bosendorfer', password: 'feathers'}, function(){
      todos.find({query: {username: 'bosendorfer'}}, function(){
        done();
      });
    });
  });

  it('adds the user\'s id at the custom location "smurfId"', (done) => {
    app.use('todos', memory({idField: '_id'}));
    const todos = app.service('todos');

    let customHook = function(){
      return function(hook){
        assert.equal(hook.params.query.smurf, 0, 'The smurfId was added to the query params.');
      };
    };

    todos.before({
      find: [setUser(), hooks.queryWithUserId('id', 'smurfId'), customHook()]
    });

    todos.create({username: 'bosendorfer', password: 'feathers'}, function(){
      todos.find({query: {username: 'bosendorfer'}}, function(){
        done();
      });
    });
  });

  it('returns an error if no user is logged in', (done) => {
    app.use('todos', memory({idField: '_id'}));
    const todos = app.service('todos');

    todos.before({
      find: [hooks.queryWithUserId()]
    });

    todos.create({username: 'bosendorfer', password: 'feathers'}, function(){
      todos.find({query:{}}, function(err){
        assert.equal(typeof err, 'object');
        done();
      });
    });
  });
});
