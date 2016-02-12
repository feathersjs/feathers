import assert from 'assert';
import {hooks} from '../../src/index';

describe('Auth hooks', () => {
  it('accessible at module.hooks', () => {
    assert.equal(typeof require('../../lib/index').hooks, 'object');
  });

  describe('hashPassword() hook', () => {
    it('accessible at module.hooks.hashPassword', () => {
      assert.equal(typeof require('../../lib/index').hooks.hashPassword, 'function');
    });

    describe('when hook.data does not exist', () => {
      it('does not do anything', () => {
        let hook = {
          foo: { password: 'password' }
        };

        hook = hooks.hashPassword()(hook);
        assert.equal(hook.data, undefined);
      });
    });

    describe('when hook.data does exist', () => {
      it('attaches hashed password to hook.data', (done) => {
        let hook = {
          data: { password: 'password' }
        };

        hooks.hashPassword()(hook).then(hook => {
          assert.ok(hook.data.password);
          assert.notEqual(hook.data.custom, 'password');
          done();
        });
      });

      it('supports custom password fields', (done) => {
        let hook = {
          data: { custom: 'password' }
        };

        hooks.hashPassword({ passwordField: 'custom'})(hook).then(hook => {
          assert.ok(hook.data.custom);
          assert.notEqual(hook.data.custom, 'password');
          done();
        });
      });
    });
  });
});


// describe('The queryWithUserId() hook', () => {
//   it('is found at module.hooks.queryWithUserId', () => {
//     assert.equal(typeof require('../../lib/index').hooks.queryWithUserId, 'function');
//   });

//   it('adds the user\'s _id at the default location "userId"', (done) => {
//     app.use('todos', memory({idField: '_id'}));
//     const todos = app.service('todos');

//     let setUser = function(){
//       return function(hook){
//         hook.params.user = {
//           username: 'steinway',
//           _id: 0
//         };
//       };
//     };

//     let customHook = function(){
//       return function(hook){
//         assert.equal(hook.params.query.userId, 0, 'The userId was added to the query params.');
//       };
//     };

//     todos.before({
//       find: [setUser(), hooks.queryWithUserId(), customHook()]
//     });

//     todos.create({username: 'bosendorfer', password: 'feathers'}, function(){
//       todos.find({query: {username: 'bosendorfer'}}, function(){
//         done();
//       });
//     });
//   });

//   it('adds the user\'s id at the custom location "smurfId"', (done) => {
//     app.use('todos', memory({idField: '_id'}));
//     const todos = app.service('todos');

//     let customHook = function(){
//       return function(hook){
//         assert.equal(hook.params.query.smurf, 0, 'The smurfId was added to the query params.');
//       };
//     };

//     todos.before({
//       find: [setUser(), hooks.queryWithUserId('id', 'smurfId'), customHook()]
//     });

//     todos.create({username: 'bosendorfer', password: 'feathers'}, function(){
//       todos.find({query: {username: 'bosendorfer'}}, function(){
//         done();
//       });
//     });
//   });

//   it('returns an error if no user is logged in', (done) => {
//     app.use('todos', memory({idField: '_id'}));
//     const todos = app.service('todos');

//     todos.before({
//       find: [hooks.queryWithUserId()]
//     });

//     todos.create({username: 'bosendorfer', password: 'feathers'}, function(){
//       todos.find({query:{}}, function(err){
//         assert.equal(typeof err, 'object');
//         done();
//       });
//     });
//   });
