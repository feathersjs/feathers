(function($) {
  $.fn.todos = function(host) {
    var el = this;
    var socket = io.connect(host);

    var app = {
      addTodo: function(todo) {
        var html = '<li class="page-header checkbox" data-id="' + todo.id + '">' +
              '<label><input type="checkbox" name="done">' +
              todo.description +
              '</label><a href="javascript://" class="pull-right delete">' +
              '<span class="icon-remove"></span>' +
              '</a></li>';

        el.find('.todos').append(html);
        app.updateTodo(todo);
      },
      removeTodo: function(todo) {
        el.find('[data-id="' + todo.id + '"]').remove();
      },
      updateTodo: function(todo) {
        var element = el.find('[data-id="' + todo.id + '"]');
        var checkbox = element.find('[name="done"]').removeAttr('disabled');

        if(todo.done) {
          element.addClass('done');
          checkbox.prop('checked', true);
        } else {
          element.removeClass('done');
          checkbox.prop('checked', false);
        }
      },
      errorHandler: function(error) {
        if(error) {
          alert(error.message);
        }
      }
    };

    el.on('submit', 'form', function (ev) {
      var field = $(this).find('[name="description"]');
   
      if(field.val().replace(/^\s+|\s+$/g, '') !== '') {
        socket.emit('todos::create', {
          description: field.val()
        }, {}, app.errorHandler);
     
        field.val('');
      }
      
      ev.preventDefault();
    }).on('click', '.delete', function (ev) {
      var id = $(this).parents('li').data('id');
      socket.emit('todos::remove', id, {}, app.errorHandler);
      ev.preventDefault();
    }).on('click', '[name="done"]', function(ev) {
      var id = $(this).parents('li').data('id');

      $(this).attr('disabled', 'disabled');

      socket.emit('todos::update', id, {
        done: $(this).is(':checked')
      }, {}, app.errorHandler);
    });

    socket.on('todos updated', app.updateTodo);
    socket.on('todos removed', app.removeTodo);
    socket.on('todos created', app.addTodo);
    socket.emit('todos::find', {}, function (error, todos) {
      todos.forEach(app.addTodo);
    });
  };
})(jQuery);