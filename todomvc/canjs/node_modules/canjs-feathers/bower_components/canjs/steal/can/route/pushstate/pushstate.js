/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#route/pushstate/pushstate*/
// # can/route/pushstate/pushstate.js
//
// Plugin for `can.route` which uses browser `history.pushState` support
// to update window's pathname instead of the `hash`.
//
// It registers itself as binding on `can.route`, intercepts `click` events
// on `<a>` elements across document and accordingly updates `can.route` state
// and window's pathname.

/*jshint maxdepth:6*/

steal('can/util', 'can/route', function (can) {
	"use strict";

	// Initialize plugin only if browser supports pushstate.
	if (window.history && history.pushState) {

		// Registers itself within `can.route.bindings`.
		can.route.bindings.pushstate = {
			/**
			 * @property {String} can.route.pushstate.root
			 * @parent can.route.pushstate
			 *
			 * @description Configure the base url that will not be modified.
			 *
			 * @option {String} Represents the base url that pushstate will prepend to all
			 * routes.  `root` defaults to: `"/"`.
			 *
			 * @body
			 *
			 * ## Use
			 *
			 * By default, a route like:
			 *
			 *     can.route(":type/:id")
			 *
			 * Matches urls like:
			 *
			 *     http://domain.com/contact/5
			 *
			 * But sometimes, you only want to match pages within a certain directory.  For
			 * example, an application that is a filemanager.  You might want to
			 * specify root and routes like:
			 *
			 *     can.route.pushstate.root = "/filemanager/"
			 *     can.route("file-:fileId");
			 *     can.route("folder-:fileId")
			 *
			 * Which matches urls like:
			 *
			 *     http://domain.com/filemanager/file-34234
			 *
			 */

			// Start of `location.pathname` is the root.
			// (Can be configured via `can.route.bindings.pushstate.root`)
			root: "/",
			// don't greedily match slashes in routing rules
			matchSlashes: false,
			paramsMatcher: /^\?(?:[^=]+=[^&]*&)*[^=]+=[^&]*/,
			querySeparator: '?',

			// ## bind

			// Intercepts clicks on `<a>` elements and rewrites original `history` methods.
			bind: function () {
				// Intercept routable links.
				can.delegate.call(can.$(document.documentElement), 'a', 'click', anchorClickHandler);

				// Rewrites original `pushState`/`replaceState` methods on `history` and keeps pointer to original methods
				can.each(methodsToOverwrite, function (method) {
					originalMethods[method] = window.history[method];
					window.history[method] = function (state, title, url) {
						// Avoid doubled history states (with pushState).
						var absolute = url.indexOf("http") === 0;
						var searchHash = window.location.search + window.location.hash;
						// If url differs from current call original histoy method and update `can.route` state.
						if ((!absolute && url !== window.location.pathname + searchHash) || (absolute && url !== window.location.href + searchHash)) {
							originalMethods[method].apply(window.history, arguments);
							can.route.setState();
						}
					};
				});

				// Bind to `popstate` event, fires on back/forward.
				can.bind.call(window, 'popstate', can.route.setState);
			},

			// ## unbind

			// Unbinds and restores original `history` methods
			unbind: function () {
				can.undelegate.call(can.$(document.documentElement), 'click', 'a', anchorClickHandler);

				can.each(methodsToOverwrite, function (method) {
					window.history[method] = originalMethods[method];
				});
				can.unbind.call(window, 'popstate', can.route.setState);
			},

			// ## matchingPartOfURL

			// Returns matching part of url without root.
			matchingPartOfURL: function () {
				var root = cleanRoot(),
					loc = (location.pathname + location.search),
					index = loc.indexOf(root);

				return loc.substr(index + root.length);
			},

			// ## setURL

			// Updates URL by calling `pushState`.
			setURL: function (path, changed) {
				var method = "pushState";
				// Keeps hash if not in path.
				if (includeHash && path.indexOf("#") === -1 && window.location.hash) {
					path += window.location.hash;
				}
				if(replaceStateAttrs.length > 0) {
					var toRemove = [];
					for(var i = 0, l = changed.length; i < l; i++) {
						if(can.inArray(changed[i], replaceStateAttrs) !== -1) {
							method = "replaceState";
						}
						if(can.inArray(changed[i], replaceStateAttrs.once) !== -1) {
							toRemove.push(changed[i]);
						}
					}
					if(toRemove.length > 0) {
						removeAttrs(replaceStateAttrs, toRemove);
						removeAttrs(replaceStateAttrs.once, toRemove);
					}
				}
				window.history[method](null, null, can.route._call("root") + path);
			}
		};

		// ## anchorClickHandler

		// Handler function for `click` events.
		var anchorClickHandler = function (e) {
			if (!(e.isDefaultPrevented ? e.isDefaultPrevented() : e.defaultPrevented === true)) {
				// YUI calls back events triggered with this as a wrapped object.
				var node = this._node || this;
				// Fix for IE showing blank host, but blank host means current host.
				var linksHost = node.host || window.location.host;

				// If link is within the same domain and descendant of `root`
				if (window.location.host === linksHost) {
					var root = cleanRoot();
					if (node.pathname.indexOf(root) === 0) {

						// Removes root from url.
						var url = (node.pathname + node.search).substr(root.length);
						// If a route matches update the data.
						var curParams = can.route.deparam(url);
						if (curParams.hasOwnProperty('route')) {
							// Makes it possible to have a link with a hash.
							includeHash = true;
							window.history.pushState(null, null, node.href);

							// Test if you can preventDefault
							// our tests can't call .click() b/c this
							// freezes phantom.
							if (e.preventDefault) {
								e.preventDefault();
							}
						}
					}
				}
			}
		},

			// ## cleanRoot

			// Always returns clean root, without domain.
			cleanRoot = function () {
				var domain = location.protocol + "//" + location.host,
					root = can.route._call("root"),
					index = root.indexOf(domain);
				if (index === 0) {
					return root.substr(domain.length);
				}
				return root;
			},
			removeAttrs = function(arr, attrs) {
				var index;
				for(var i = attrs.length - 1; i >= 0; i--) {
					if( (index = can.inArray(attrs[i], arr)) !== -1) {
						arr.splice(index, 1);
					}
				}
			},
			// Original methods on `history` that will be overwritten
			methodsToOverwrite = ['pushState', 'replaceState'],
			// A place to store pointers to original `history` methods.
			originalMethods = {},
			// Used to tell setURL to include the hash because we clicked on a link.
			includeHash = false,
			// Attributes that will cause replaceState to be called
			replaceStateAttrs = [];

		// Enables plugin, by default `hashchange` binding is used.
		can.route.defaultBinding = "pushstate";

		can.extend(can.route, {
			replaceStateOn: function() {
				var attrs = can.makeArray(arguments);
				Array.prototype.push.apply(replaceStateAttrs, attrs);
			},
			replaceStateOnce: function() {
				var attrs = can.makeArray(arguments);
				replaceStateAttrs.once = can.makeArray(replaceStateAttrs.once);

				Array.prototype.push.apply(replaceStateAttrs.once, attrs);
				can.route.replaceStateOn.apply(this, arguments);
			},
			replaceStateOff: function() {
				var attrs = can.makeArray(arguments);
				removeAttrs(replaceStateAttrs, attrs);
			}
		});
	}

	return can;
});

