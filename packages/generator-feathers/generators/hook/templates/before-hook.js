// <%= hookPath %>.js
// Use this hook to manipulate incoming data
// or params before it is sent to the database.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

export default function(options) {
  return function(hook) {
    // Setting a custom property
    hook.awesome = 'feathers';

    // Accessing params
    console.log('Params', hook.params);

    // manipulating data after a service method call
    if (hook.data) {
      hook.data.feathers = 'awesome';  
    }

    // checking the app object for a config variable
    hook.app.get('port');

    console.log('My custom hook ran. Feathers is awesome!');

    // You can also manipulate your data inside a promise
    // so that you can chain async hooks.
    // See http://docs.feathersjs.com/hooks/readme.html#promises
    // return new Promise(function(resolve, reject) {
    //   hook.params.feathers = 'awesome';
    //   resolve(hook);
    // });
  }
}