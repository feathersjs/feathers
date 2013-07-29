var feathers = require('../../lib/feathers');
var Proto = require('uberproto');
var express = require('express');

// Services

var users = feathers.service.mongodb({ collection: 'users' });
var posts = feathers.service.mongodb({ collection: 'posts' });
var comments = feathers.service.mongodb({ collection: 'comments' });

// Associations
//-----------------------------
// Option #1:
//
// users.has({
//   posts: ['posts'],
//   comments: ['comments']
// });

// posts.has({
//   author: 'users',
//   comments: ['comments']
// });

// comments.has({
//   author: 'users',
//   post: 'posts'
// });

// What we want to end up with internally:
//
// var associations = {
//   'users': [
//     {
//       hasMany: 'posts',
//       key: 'author'
//     },
//     {
//       hasMany: 'comments',
//       key: 'author'
//     }
//   ],
//   'posts': [
//     {
//       hasMany: 'comments',
//       key: 'post'
//     },
//     {
//       hasOne: 'users',
//       key: 'id'
//     }
//   ],
//   'comments': {
//     hasOne: 'users',
//     key: 'id'
//   }
// };

// {
//   "title": "The great novel",
//   "author": "1",
//   "body": "Lorem ipsum",
//   "comments": []
// }

// Create Server
feathers.createServer()
  .use(express.static(__dirname))
  .service('users', users)
  .service('posts', posts)

  // Option #2:
  .associate('users').withMany('posts').via('id')
  .associate('posts').withOne('user').via('author')
  .service('comments', comments)
  .provide(feathers.rest())
  .provide(feathers.socketio())
  .start();