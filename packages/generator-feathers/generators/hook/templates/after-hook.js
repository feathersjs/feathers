// <%= hookPath %>.js
// 
// Use this hook to manipulate data after it has been fetched
// from the database and before it gets sent to the user. For more
// information on hooks see: http://docs.feathersjs.com/hooks/readme.html

export default function(options = {}) {
  const defaults = {};
  options = Object.assign({}, defaults, options);

  return function(hook) {
    // manipulating data after a service method call
    if (hook.type === 'after') {
      console.log('My before hook ran after');
    }
  };
}