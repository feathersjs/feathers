// <%= hookPath %>.js
// Use this hook to manipulate data after it has been fetched
// from the database and before it gets sent to the user. For more
// information on hooks see: https://github.com/feathersjs/feathers-hooks

export default function(hook) {
  // Manipulate your results inside a
  // promise so that you can chain them.
  // See https://github.com/feathersjs/feathers-hooks#promises
  return new Promise(function(resolve, reject) {
    hook.result.feathers = 'awesome';
    resolve(hook);
  });
}