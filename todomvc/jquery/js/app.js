/*global jQuery, Handlebars, Router */
jQuery(function ($) {
	'use strict';

	Handlebars.registerHelper('eq', function (a, b, options) {
		return a === b ? options.fn(this) : options.inverse(this);
	});

	var ENTER_KEY = 13;
	var ESCAPE_KEY = 27;

	var util = {
		pluralize: function (count, word) {
			return count === 1 ? word : word + 's';
		}
	};

	var App = {
		init: function () {
			this.todos = [];
			this.socket = io('http://todos.feathersjs.com');
			this.app = feathers().configure(feathers.socketio(this.socket));
			this.service = this.app.service('todos');

			this.cacheElements();
			this.bindEvents();

			new Router({
				'/:filter': function (filter) {
					this.filter = filter;
					this.render();
				}.bind(this)
			}).init('/all');

			this.service.find(this.updateAll.bind(this));
		},
		cacheElements: function () {
			this.todoTemplate = Handlebars.compile($('#todo-template').html());
			this.footerTemplate = Handlebars.compile($('#footer-template').html());
			this.$todoApp = $('#todoapp');
			this.$header = this.$todoApp.find('#header');
			this.$main = this.$todoApp.find('#main');
			this.$footer = this.$todoApp.find('#footer');
			this.$newTodo = this.$header.find('#new-todo');
			this.$toggleAll = this.$main.find('#toggle-all');
			this.$todoList = this.$main.find('#todo-list');
			this.$count = this.$footer.find('#todo-count');
			this.$clearBtn = this.$footer.find('#clear-completed');
		},
		bindEvents: function () {
			var list = this.$todoList;
			var service = this.service;

			this.$newTodo.on('keyup', this.create.bind(this));
			this.$toggleAll.on('change', this.toggleAll.bind(this));
			this.$footer.on('click', '#clear-completed', this.destroyCompleted.bind(this));

			list.on('change', '.toggle', this.toggle.bind(this));
			list.on('dblclick', 'label', this.edit.bind(this));
			list.on('keyup', '.edit', this.editKeyup.bind(this));
			list.on('focusout', '.edit', this.update.bind(this));
			list.on('click', '.destroy', this.destroy.bind(this));

			service.on('updated', this.updateTodo.bind(this));
			service.on('created', this.createTodo.bind(this));
			service.on('removed', this.removeTodo.bind(this));
		},
		updateAll: function(error, todos) {
			this.todos = todos;
			this.render();
		},
		createTodo: function(todo) {
			this.todos.push(todo);
			this.render();
		},
		updateTodo: function(todo) {
			this.todos[this.indexFromId(todo.id)] = todo;
			this.render();
		},
		removeTodo: function(todo) {
			this.todos.splice(this.indexFromId(todo.id), 1);
			this.render();
		},
		render: function () {
			if(!this.editing) {
				var filtered = this.getFilteredTodos();
				this.$todoList.html(this.todoTemplate(filtered));
				this.$main.toggle(filtered.length > 0);
				this.$toggleAll.prop('checked', this.getActiveTodos().length === 0);
				this.renderFooter();
				this.$newTodo.focus();
			}
		},
		renderFooter: function () {
			var todoCount = this.todos.length;
			var activeTodoCount = this.getActiveTodos().length;
			var template = this.footerTemplate({
				activeTodoCount: activeTodoCount,
				activeTodoWord: util.pluralize(activeTodoCount, 'item'),
				completedTodos: todoCount - activeTodoCount,
				filter: this.filter
			});

			this.$footer.toggle(todoCount > 0).html(template);
		},
		toggleAll: function (e) {
			var isChecked = $(e.target).prop('checked');
			var service = this.service;

			this.todos.forEach(function (todo) {
				todo.complete = isChecked;
				service.update(todo.id, todo);
			});
		},
		getActiveTodos: function () {
			return this.todos.filter(function (todo) {
				return !todo.complete;
			});
		},
		getCompletedTodos: function () {
			return this.todos.filter(function (todo) {
				return todo.complete;
			});
		},
		getFilteredTodos: function () {
			if (this.filter === 'active') {
				return this.getActiveTodos();
			}

			if (this.filter === 'completed') {
				return this.getCompletedTodos();
			}

			return this.todos;
		},
		destroyCompleted: function () {
			var completed = this.getCompletedTodos();
			var service = this.service;

			completed.forEach(function(todo) {
				service.remove(todo.id);
			});

			this.filter = 'all';
		},
		// accepts an element from inside the `.item` div and
		// returns the corresponding index in the `todos` array
		indexFromEl: function (el) {
			var id = $(el).closest('li').data('id');
			return this.indexFromId(id);
		},
		indexFromId: function(id) {
			var todos = this.todos;
			var i = todos.length;

			while (i--) {
				if (todos[i].id === id) {
					return i;
				}
			}
		},
		create: function (e) {
			var $input = $(e.target);
			var val = $input.val().trim();

			if (e.which !== ENTER_KEY || !val) {
				return;
			}

			this.service.create({
				text: val,
				complete: false
			});

			$input.val('');
		},
		toggle: function (e) {
			var i = this.indexFromEl(e.target);
			var todo = this.todos[i];
			todo.complete = !todo.complete;
			this.service.update(todo.id, todo);
		},
		edit: function (e) {
			var $input = $(e.target).closest('li').addClass('editing').find('.edit');
			$input.val($input.val()).focus();
			this.editing = true;
		},
		editKeyup: function (e) {
			if (e.which === ENTER_KEY) {
				this.editing = false;
				e.target.blur();
			}

			if (e.which === ESCAPE_KEY) {
				this.editing = false;
				$(e.target).data('abort', true).blur();
			}
		},
		update: function (e) {
			var el = e.target;
			var $el = $(el);
			var val = $el.val().trim();

			if ($el.data('abort')) {
				$el.data('abort', false);
				this.render();
				return;
			}

			var i = this.indexFromEl(el);
			var todo = this.todos[i];

			if (val) {
				todo.text = val;
				this.service.update(todo.id, todo);
			} else {
				this.service.remove(todo.id);
			}

			this.render();
		},
		destroy: function (e) {
			var todo = this.todos[this.indexFromEl(e.target)];
			this.service.remove(todo.id);
		}
	};

	App.init();
});
