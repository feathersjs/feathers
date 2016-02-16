// <%= hookPath %>.js
// 
// Use this hook to manipulate incoming data or params before it is sent to the database.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

export default function(options = {}) {
  const defaults = {};
  options = Object.assign({}, defaults, options);

  return function(hook) {
    if (hook.type === 'before') {
      console.log('My before hook ran before');
    }
  };
}