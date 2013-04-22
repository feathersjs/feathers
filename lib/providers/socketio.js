var Proto = require('uberproto');
var _ = require('underscore');
var express = require('express');
var socketio = require('socket.io');
var methods = [ 'index', 'get', 'create', 'update', 'destroy' ];

var SocketIoProvider = Proto.extend({
	init: function (configuration) {
		this.configuration = configuration || {};
		this.services = {};
	},

	register: function (path, service) {
		this.services[path] = service;
	},

	_io: function(server) {
		var io = socketio.listen(server.configuration.http);

		io.enable('browser client etag');
		io.set('log level', 0);

		io.set('transports', [
			'xhr-polling', 'websocket', 'flashsocket',
			'htmlfile', 'jsonp-polling'
		]);

		return io;
	},

	start: function (server) {
		var io = this._io(server);
		var services = this.services;

		_.each(services, function(service, path) {
			// If the service emits events that we want to listen to (Event mixin)
			if(typeof service.on === 'function' && service._serviceEvents) {
				_.each(service._serviceEvents, function(ev) {
					service.on(ev, function(data) {
						io.sockets.emit(path + ' ' + ev, data);
					});
				});
			}
		});

		io.sockets.on('connection', function (socket) {
			_.each(services, function (service, path) {
				_.each(methods, function(method) {
					var name = path + '::' + method;
					if(service[method]) {
						socket.on(name, _.bind(service[method], service));
					}
				});
			});
		});

		server.http();

		return this;
	}
});

module.exports = SocketIoProvider;
