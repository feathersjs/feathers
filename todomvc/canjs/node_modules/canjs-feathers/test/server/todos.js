var tagsToReplace = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
};

// Escapes HTML so that evil people can't inject mean things into the page
function escapeHtml(str) {
  return str.replace(/[&<>]/g, function (tag) {
    return tagsToReplace[tag] || tag;
  });
}

function TodoStore() {
  this.todos = [];
  this.lastId = 0;
}

// Returns a Todo by it's id
TodoStore.prototype.getById = function (id) {
  var currentTodo;
  for (var i = 0; i < this.todos.length; i++) {
    currentTodo = this.todos[i];
    if (currentTodo.id === parseInt(id, 10)) {
      return currentTodo;
    }
  }

  return null;
};

TodoStore.prototype.find = function (params, callback) {
  callback(null, this.todos);
};

TodoStore.prototype.get = function (id, params, callback) {
  var todo = this.getById(id);
  if (todo === null) {
    return callback(new Error('Todo not found'));
  }

  callback(null, todo);
};

TodoStore.prototype.create = function (data, params, callback) {
  // Create our actual Todo object so that we only get what we really want
  var newTodo = {
    id: this.lastId++,
    description: escapeHtml(data.description),
    done: !!data.done
  };

  this.todos.push(newTodo);

  callback(null, newTodo);
};

TodoStore.prototype.update = function (id, data, params, callback) {
  var todo = this.getById(id);
  if (todo === null) {
    return callback(new Error('Todo does not exist'));
  }

  // We only want to update the `done` property
  // !! is used for sanitization turning everything into a real booelan
  todo.done = !!data.done;
  todo.description = data.description;

  callback(null, todo);
};

TodoStore.prototype.remove = function (id, params, callback) {
  var todo = this.getById(id);
  if (todo === null) {
    return callback(new Error('Can not delete Todo'));
  }

  // Just splice our todo out of the array
  this.todos.splice(this.todos.indexOf(todo), 1);

  callback(null, todo);
};

TodoStore.prototype.clear = function() {
  this.todos = [];
  this.lastId = 0;
};

module.exports = TodoStore;