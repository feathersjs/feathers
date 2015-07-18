/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#util/util*/
/*
 YUI modules: http://yuilibrary.com/yui/configurator/
 node
 io-base
 querystring
 event-focus
 array-extras
 */

// This was used to build the custom YUI download. Re-run it to generate a new yui-<version>.js file
//	var yuilibs = ['yui-base/yui-base.js', 'oop/oop.js', 'event-custom-base/event-custom-base.js', 'features/features.js', 'dom-core/dom-core.js', 'dom-base/dom-base.js', 'selector-native/selector-native.js', 'selector-css2/selector-css2.js', 'selector/selector.js', 'node-core/node-core.js', 'node-base/node-base.js', 'event-base/event-base.js', 'event-delegate/event-delegate.js', 'node-event-delegate/node-event-delegate.js', 'pluginhost-base/pluginhost-base.js', 'pluginhost-config/pluginhost-config.js', 'node-pluginhost/node-pluginhost.js', 'dom-style/dom-style.js', 'dom-screen/dom-screen.js', 'node-screen/node-screen.js', 'node-style/node-style.js', 'querystring-stringify-simple/querystring-stringify-simple.js', 'io-base/io-base.js', 'array-extras/array-extras.js', 'querystring-parse/querystring-parse.js', 'querystring-stringify/querystring-stringify.js', 'event-custom-complex/event-custom-complex.js', 'event-synthetic/event-synthetic.js', 'event-focus/event-focus.js']
//
//	var url = "http://yui.yahooapis.com/combo?3.7.3/build/" + yuilibs.join("&3.7.3/build/")

steal('can/util/can.js', "can/util/attr", 'yui', 'can/event',
	"can/util/fragment.js", 'can/util/array/each.js',
	'can/util/object/isplain', 'can/util/deferred.js',
	'can/util/hashchange.js', "can/util/inserted", function (can, attr, YUI) {
		YUI = YUI || window.YUI;
		// lets overwrite 
		YUI.add('can-modifications', function (Y, NAME) {
			var addHTML = Y.DOM.addHTML;

			Y.DOM.addHTML = function (node, content, where) {
				if (typeof content === "string" || typeof content === "number") {
					content = can.buildFragment(content);
				}
				var elems;
				if (content.nodeType === 11) {
					elems = can.makeArray(content.childNodes);
				} else {
					elems = [content];
				}
				var ret = addHTML.call(this, node, content, where);

				can.inserted(elems);

				return ret;
			};

			var oldOn = Y.Node.prototype.on;
			Y.Node.prototype.on = function (type, fn) {
				if (type === "attributes") {
					// YUI changes where the extra data comes from
					var el = can.$(this);
					can.data(el, "canHasAttributesBindings", (can.data(el, "canHasAttributesBindings") || 0) + 1);

					var handle = oldOn.apply(this, arguments),
						oldDetach = handle.detach;
					handle.detach = function () {
						var cur = can.data(el, "canHasAttributesBindings") || 0;
						if (cur <= 0) {
							can.cleanData(el, "canHasAttributesBindings");
						} else {
							can.data(el, "canHasAttributesBindings", cur - 1);
						}
						return oldDetach.apply(this, arguments);
					};
					return handle;
				} else {
					return oldOn.apply(this, arguments);
				}
			};

		}, '3.7.3', {
			"requires": ["node-base"]
		});

		// ---------
		// _YUI node list._
		// `can.Y` is set as part of the build process.
		// `YUI().use('*')` is called for when `YUI` is statically loaded (like when running tests).
		var Y = can.Y = can.Y || YUI()
			.use('*');
		// Map string helpers.
		can.trim = function (s) {
			return Y.Lang.trim(s);
		};
		// Map array helpers.
		can.makeArray = function (arr) {
			if (!arr) {
				return [];
			}
			return Y.Array(arr);
		};
		can.isArray = Y.Lang.isArray;
		can.inArray = function (item, arr, fromIndex) {
			if (!arr) {
				return -1;
			}
			return Y.Array.indexOf(arr, item, fromIndex);
		};
		can.map = function (arr, fn) {
			return Y.Array.map(can.makeArray(arr || []), fn);
		};
		// Map object helpers.
		can.extend = function (first) {
			var deep = first === true ? 1 : 0,
				target = arguments[deep],
				i = deep + 1,
				arg;
			for (; arg = arguments[i]; i++) {
				Y.mix(target, arg, true, null, null, !!deep);
			}
			return target;
		};
		can.param = function (object) {
			return Y.QueryString.stringify(object, {
				arrayKey: true
			});
		};
		can.isEmptyObject = function (object) {
			return Y.Object.isEmpty(object);
		};
		// Map function helpers.
		can.proxy = function (func, context) {
			return Y.bind.apply(Y, arguments);
		};
		can.isFunction = function (f) {
			return Y.Lang.isFunction(f);
		};
		// Element -- get the wrapped helper.
		var prepareNodeList = function (nodelist) {
			nodelist.each(function (node, i) {
				nodelist[i] = node.getDOMNode();
			});
			nodelist.length = nodelist.size();
			return nodelist;
		};
		can.$ = function (selector) {
			if (selector === window) {
				return window;
			} else if (selector instanceof Y.NodeList) {
				return prepareNodeList(selector);
			} else if (typeof selector === 'object' && !can.isArray(selector) && typeof selector.nodeType === 'undefined' && !selector.getDOMNode) {
				return new Y.NodeList(selector);
			} else {
				return prepareNodeList(Y.all(selector));
			}
		};
		can.get = function (wrapped, index) {
			return wrapped._nodes[index];
		};
		can.append = function (wrapped, html) {
			wrapped.each(function (node) {
				if (typeof html === 'string') {
					html = can.buildFragment(html, node);
				}
				node.append(html);
			});
		};
		can.addClass = function (wrapped, className) {
			return wrapped.addClass(className);
		};
		can.data = function (wrapped, key, value) {
			if(!wrapped.item(0)) { return; }
			if (value === undefined) {
				return wrapped.item(0)
					.getData(key);
			} else {
				return wrapped.item(0)
					.setData(key, value);
			}
		};
		can.remove = function (wrapped) {
			return wrapped.remove() && wrapped.destroy();
		};
		can.has = function (wrapped, node) {
			if (Y.DOM.contains(wrapped[0], node)) {
				return wrapped;
			} else {
				return [];
			}
		};
		// Destroyed method.
		can._yNodeRemove = can._yNodeRemove || Y.Node.prototype.remove;
		Y.Node.prototype.remove = function () {
			// make sure this is only fired on normal nodes, if it
			// is fired on a text node, it will bubble because
			// the method used to stop bubbling (listening to an event)
			// does not work on text nodes
			var node = this.getDOMNode();
			if (node.nodeType === 1) {
				can.trigger(this, 'removed', [], false);
				var elems = node.getElementsByTagName('*');
				for (var i = 0, elem;
						 (elem = elems[i]) !== undefined; i++) {
					can.trigger(elem, 'removed', [], false);
				}
			}
			can._yNodeRemove.apply(this, arguments);
		};
		// Let `nodelist` know about the new destroy...
		Y.NodeList.addMethod('remove', Y.Node.prototype.remove);
		// Ajax
		var optionsMap = {
			type: 'method',
			success: undefined,
			error: undefined
		};
		var updateDeferred = function (request, d) {
			// `YUI` only returns a request if it is asynchronous.
			if (request && request.io) {
				var xhr = request.io;
				for (var prop in xhr) {
					if (typeof d[prop] === 'function') {
						d[prop] = function () {
							xhr[prop].apply(xhr, arguments);
						};
					} else {
						d[prop] = prop[xhr];
					}
				}
			}
		};
		can.ajax = function (options) {
			var d = can.Deferred(),
				requestOptions = can.extend({}, options);
			for (var option in optionsMap) {
				if (requestOptions[option] !== undefined) {
					requestOptions[optionsMap[option]] = requestOptions[option];
					delete requestOptions[option];
				}
			}
			requestOptions.sync = !options.async;
			var success = options.success,
				error = options.error;
			requestOptions.on = {
				success: function (transactionid, response) {
					var data = response.responseText;
					if (options.dataType === 'json') {
						data = eval('(' + data + ')');
					}
					updateDeferred(request, d);
					d.resolve(data);
					if (success) {
						success(data, 'success', request);
					}
				},
				failure: function (transactionid, response) {
					updateDeferred(request, d);
					d.reject(request, 'error');
					if (error) {
						error(request, 'error');
					}
				}
			};
			var request = Y.io(requestOptions.url, requestOptions);
			updateDeferred(request, d);
			return d;
		};
		// Events - The `id` of the `function` to be bound, used as an expando on the `function`
		// so we can lookup it's `remove` object.
		var yuiEventId = 0,
		// Takes a node list, goes through each node
		// and adds events data that has a map of events to
		// `callbackId` to `remove` object.  It looks like
		// `{click: {5: {remove: fn}}}`.
			addBinding = function (nodelist, selector, ev, cb) {
				if (nodelist instanceof Y.NodeList || !nodelist.on || nodelist.getDOMNode) {
					nodelist.each(function (node) {
						node = can.$(node);
						var events = can.data(node, 'events'),
							eventName = ev + ':' + selector;
						if (!events) {
							can.data(node, 'events', events = {});
						}
						if (!events[eventName]) {
							events[eventName] = {};
						}
						if (cb.__bindingsIds === undefined) {
							cb.__bindingsIds = yuiEventId++;
						}
						events[eventName][cb.__bindingsIds] = selector ? node.item(0)
							.delegate(ev, cb, selector) : node.item(0)
							.on(ev, cb);
					});
				} else {
					var obj = nodelist,
						events = obj.__canEvents = obj.__canEvents || {};
					if (!events[ev]) {
						events[ev] = {};
					}
					if (cb.__bindingsIds === undefined) {
						cb.__bindingsIds = yuiEventId++;
					}
					events[ev][cb.__bindingsIds] = obj.on(ev, cb);
				}
			},
		// Removes a binding on a `nodelist` by finding
		// the remove object within the object's data.
			removeBinding = function (nodelist, selector, ev, cb) {
				if (nodelist instanceof Y.NodeList || !nodelist.on || nodelist.getDOMNode) {
					nodelist.each(function (node) {
						node = can.$(node);
						var events = can.data(node, 'events');
						if (events) {
							var eventName = ev + ':' + selector,
								handlers = events[eventName],
								handler = handlers[cb.__bindingsIds];
							handler.detach();
							delete handlers[cb.__bindingsIds];
							if (can.isEmptyObject(handlers)) {
								delete events[ev];
							}
							if (can.isEmptyObject(events)) {
							}
						}
					});
				} else {
					var obj = nodelist,
						events = obj.__canEvents || {}, handlers = events[ev],
						handler = handlers[cb.__bindingsIds];
					handler.detach();
					delete handlers[cb.__bindingsIds];
					if (can.isEmptyObject(handlers)) {
						delete events[ev];
					}
					if (can.isEmptyObject(events)) {
					}
				}
			};
		can.bind = function (ev, cb) {
			// If we can bind to it...
			if (this.bind && this.bind !== can.bind) {
				this.bind(ev, cb);
			} else if (this.on || this.nodeType) {
				addBinding(can.$(this), undefined, ev, cb);
			} else if (this.addEvent) {
				this.addEvent(ev, cb);
			} else {
				// Make it bind-able...
				can.addEvent.call(this, ev, cb);
			}
			return this;
		};
		can.unbind = function (ev, cb) {
			// If we can bind to it...
			if (this.unbind && this.unbind !== can.unbind) {
				this.unbind(ev, cb);
			} else if (this.on || this.nodeType) {
				removeBinding(can.$(this), undefined, ev, cb);
			} else {
				// Make it bind-able...
				can.removeEvent.call(this, ev, cb);
			}
			return this;
		};
		// Alias on/off to bind/unbind respectively
		can.on = can.bind;
		can.off = can.unbind;
		can.trigger = function (item, event, args, bubble) {
			if (item instanceof Y.NodeList) {
				item = item.item(0);
			}
			if (item.getDOMNode) {
				item = item.getDOMNode();
			}
			if (item.nodeName) {
				item = Y.Node(item);
				if (bubble === false) {
					// Force stop propagation by listening to `on` and then
					// immediately disconnecting
					item.once(event, function (ev) {
						if (ev.stopPropagation) {
							ev.stopPropagation();
						}
						ev.cancelBubble = true;
						if (ev._stopper) {
							ev._stopper();
						}
					});
				}
				if (typeof event !== 'string') {
					args = event;
					event = args.type;
					delete args.type;
				}
				realTrigger(item.getDOMNode(), event, args || {});
			} else {
				if (typeof event === 'string') {
					event = {
						type: event
					};
				}
				event.target = event.target || item;
				can.dispatch.call(item, event, can.makeArray(args));
			}
		};
		// Allow `dom` `destroyed` events.
		Y.mix(Y.Node.DOM_EVENTS, {
			removed: true,
			inserted: true,
			attributes: true,
			// foo is here for testing
			foo: true
		});

		Y.Env.evt.plugins.attributes = {
			// forces YUI not to change this event signature
			on: function () {
				var args = can.makeArray(arguments);
				return Y.Event._attach(args, {
					facade: false
				});
			}
		};

		can.delegate = function (selector, ev, cb) {
			if (this.on || this.nodeType) {
				addBinding(can.$(this), selector, ev, cb);
			} else if (this.delegate) {
				this.delegate(selector, ev, cb);
			} else {
				// make it bind-able ...
				can.bind.call(this, ev, cb);
			}
			return this;
		};
		can.undelegate = function (selector, ev, cb) {
			if (this.on || this.nodeType) {
				removeBinding(can.$(this), selector, ev, cb);
			} else if (this.undelegate) {
				this.undelegate(selector, ev, cb);
			} else {
				can.unbind.call(this, ev, cb);
			}
			return this;
		};



		// `realTrigger` taken from `dojo`.
		var /*leaveRe = /mouse(enter|leave)/,
			_fix = function (_, p) {
				return 'mouse' + (p === 'enter' ? 'over' : 'out');
			},*/ realTrigger,
			realTriggerHandler = function (n, e, evdata) {
				var node = Y.Node(n),
					handlers = can.Y.Event.getListeners(node._yuid, e),
					i;
				if (handlers) {
					for (i = 0; i < handlers.length; i++) {
						if (handlers[i].fire) {
							handlers[i].fire(evdata);
						} else if (handlers[i].handles) {
							can.each(handlers[i].handles, function (handle) {
								handle.evt.fire(evdata);
							});
						} else {
							throw "can not fire event";
						}
					}
				}
			},
			fakeTrigger = function(n, e, a){
				var stop = false;
				// a lame duck to work with. we're probably a 'custom event'
				var evdata = can.extend({
					type: e,
					target: n,
					faux: true,
					_stopper: function () {
						stop = this.cancelBubble;
					},
					stopPropagation: function () {
						stop = this.cancelBubble;
					},
					preventDefault: function(){
						
					}
				}, a);
				realTriggerHandler(n, e, evdata);
				if (e === "inserted" || e === "removed") {
					return;
				}

				// handle bubbling of custom events, unless the event was stopped.
				while (!stop && n !== document && n.parentNode) {
					n = n.parentNode;
					realTriggerHandler(n, e, evdata); //can.isFunction(n[ev]) && n[ev](evdata);
				}
			};
		if (document.createEvent) {
			realTrigger = function (n, e, a) {
				// the same branch
				fakeTrigger(n, e, a);
				return;
				/*var ev = document.createEvent('HTMLEvents');
				e = e.replace(leaveRe, _fix);
				ev.initEvent(e, e === 'removed' || e === 'inserted' ? false : true, true);
				if (a) {
					can.extend(ev, a);
				}
				n.dispatchEvent(ev);*/
			};
		} else {
			realTrigger = function (n, e, a) {
				fakeTrigger(n, e, a);
				return;
				/*
				// the janktastic branch
				var ev = 'on' + e;
				if(e === "focus" || e === "blur") {
					fakeTrigger(n, e, a);
				}
				
				try {
					// FIXME: is this worth it? for mixed-case native event support:? Opera ends up in the
					// createEvent path above, and also fails on _some_ native-named events.
					// if(lc !== e && d.indexOf(d.NodeList.events, lc) >= 0){
					// // if the event is one of those listed in our NodeList list
					// // in lowercase form but is mixed case, throw to avoid
					// // fireEvent. /me sighs. http://gist.github.com/315318
					// throw("janktastic");
					// }
					var evObj = document.createEventObject();
					if (e === "inserted" || e === "removed") {
						evObj.cancelBubble = true;
					}
					can.extend(evObj, a);
					n.fireEvent(ev, evObj);

				} catch (er) {
					fakeTrigger(n,e,a);
					
				}*/
			};
		}

		// setup attributes event
		can.attr = attr;
		delete attr.MutationObserver;

		return can;
	});

