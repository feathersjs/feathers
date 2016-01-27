// <%= hookPath %>.js
// Use this hook to manipulate incoming data
// or params before it is sent to the database.
// For more information on hooks see: https://github.com/feathersjs/feathers-hooks

export default function(hook) {
  // Manipulate your data inside a promise
  // so that you can chain them.
  // See https://github.com/feathersjs/feathers-hooks#promises
  return new Promise(function(resolve, reject) {
    hook.params.feathers = 'awesome';
    resolve(hook);
  });
}