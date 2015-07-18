/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#util/fixture/fixture*/
// # can/util/fixture.js
//
// Intercepts AJAX requests and simulates them with either a function or a
// file. This is used to develop independently from backend services.
steal('can/util', 'can/util/string', 'can/util/object', function (can) {
	// can.fixture relies on can.Object in order to work and needs to be
	// included before can.fixture in order to use it, otherwise it'll error.
	if (!can.Object) {
		throw new Error('can.fixture depends on can.Object. Please include it before can.fixture.');
	}

	// Get the URL from old Steal root, new Steal config or can.fixture.rootUrl
	var getUrl = function (url) {
		if (typeof steal !== 'undefined') {
			// New steal
			// TODO The correct way to make this work with new Steal is to change getUrl
			// to return a deferred and have the other code accept a deferred.
			if(steal.joinURIs) {
				var base = steal.config("baseUrl");
				var joined = steal.joinURIs(base, url);
				return joined;
			}

			// Legacy steal
			if (can.isFunction(steal.config)) {
				if (steal.System) {
					return steal.joinURIs(steal.config('baseURL'), url);
				}
				else {
					return steal.config()
						.root.mapJoin(url)
						.toString();
				}
			}
			return steal.root.join(url)
				.toString();
		}
		return (can.fixture.rootUrl || '') + url;
	};

	// Manipulates the AJAX prefilter to identify whether or not we should
	// manipulate the AJAX call to change the URL to a static file or call
	// a function for a dynamic fixture.
	var updateSettings = function (settings, originalOptions) {
		if (!can.fixture.on || settings.fixture === false) {
			return;
		}

		// A simple wrapper for logging fixture.js.
		var log = function () {
			//!steal-remove-start
			can.dev.log('can/fixture/fixture.js: ' + Array.prototype.slice.call(arguments)
				.join(' '));
			//!steal-remove-end
		};

		// We always need the type which can also be called method, default to GET
		settings.type = settings.type || settings.method || 'GET';

		// add the fixture option if programmed in
		var data = overwrite(settings);

			// If there is not a fixture for this AJAX request, do nothing.
		if (!settings.fixture) {
			if (window.location.protocol === "file:") {
				log("ajax request to " + settings.url + ", no fixture found");
			}
			return;
		}

		// If the fixture already exists on can.fixture, update the fixture option
		if (typeof settings.fixture === "string" && can.fixture[settings.fixture]) {
			settings.fixture = can.fixture[settings.fixture];
		}

		// If the fixture setting is a string, we just change the URL of the
		// AJAX call to the fixture URL.
		if (typeof settings.fixture === "string") {
			var url = settings.fixture;

			// If the URL starts with //, we need to update the URL to become
			// the full path.
			if (/^\/\//.test(url)) {
				// this lets us use rootUrl w/o having steal...
				url = getUrl(settings.fixture.substr(2));
			}

			if (data) {
				// Template static fixture URLs
				url = can.sub(url, data);
			}

			delete settings.fixture;

			//!steal-remove-start
			log("looking for fixture in " + url);
			//!steal-remove-end

			// Override the AJAX settings, changing the URL to the fixture file,
			// removing the data, and changing the type to GET.
			settings.url = url;
			settings.data = null;
			settings.type = "GET";
			if (!settings.error) {
				// If no error handling is provided, we provide one and throw an
				// error.
				settings.error = function (xhr, error, message) {
					throw "fixtures.js Error " + error + " " + message;
				};
			}
			// Otherwise, it is a function and we add the fixture data type so the
			// fixture transport will handle it.
		} else {
			//!steal-remove-start
			log("using a dynamic fixture for " + settings.type + " " + settings.url);
			//!steal-remove-end

			// TODO: make everything go here for timing and other fun stuff
			// add to settings data from fixture ...
			if (settings.dataTypes) {
				settings.dataTypes.splice(0, 0, "fixture");
			}

			if (data && originalOptions) {
				originalOptions.data = originalOptions.data || {};
				can.extend(originalOptions.data, data);
			}
		}
	},
		// A helper function that takes what's called with response
		// and moves some common args around to make it easier to call
		extractResponse = function (status, statusText, responses, headers) {
			// if we get response(RESPONSES, HEADERS)
			if (typeof status !== "number") {
				headers = statusText;
				responses = status;
				statusText = "success";
				status = 200;
			}
			// if we get response(200, RESPONSES, HEADERS)
			if (typeof statusText !== "string") {
				headers = responses;
				responses = statusText;
				statusText = "success";
			}
			if (status >= 400 && status <= 599) {
				this.dataType = "text";
			}
			return [status, statusText, extractResponses(this, responses), headers];
		},
		// If we get data instead of responses, make sure we provide a response
		// type that matches the first datatype (typically JSON)
		extractResponses = function (settings, responses) {
			var next = settings.dataTypes ? settings.dataTypes[0] : (settings.dataType || 'json');
			if (!responses || !responses[next]) {
				var tmp = {};
				tmp[next] = responses;
				responses = tmp;
			}
			return responses;
		};

	// Set up prefiltering and transmission handling in order to actually power
	// can.fixture. This is handled two different ways, depending on whether or
	// not CanJS is using jQuery or not.

	// If we are using jQuery, we have access to ajaxPrefilter and ajaxTransport
	if (can.ajaxPrefilter && can.ajaxTransport) {

		// the pre-filter needs to re-route the url
		can.ajaxPrefilter(updateSettings);

		can.ajaxTransport("fixture", function (s, original) {
			// remove the fixture from the datatype
			s.dataTypes.shift();

			//we'll return the result of the next data type
			var timeout, stopped = false;

			return {
				send: function (headers, callback) {
					// we'll immediately wait the delay time for all fixtures
					timeout = setTimeout(function () {
						// if the user wants to call success on their own, we allow it ...
						var success = function () {
							if (stopped === false) {
								callback.apply(null, extractResponse.apply(s, arguments));
							}
						},
							// get the result form the fixture
							result = s.fixture(original, success, headers, s);
						if (result !== undefined) {
							// Run the callback as a 200 success and with the results with the correct dataType
							callback(200, "success", extractResponses(s, result), {});
						}
					}, can.fixture.delay);
				},
				abort: function () {
					stopped = true;
					clearTimeout(timeout);
				}
			};
		});
		// If we are not using jQuery, we don't have access to those nice ajaxPrefilter
		// and ajaxTransport functions, so we need to monkey patch can.ajax.
	} else {
		var AJAX = can.ajax;
		can.ajax = function (settings) {
			updateSettings(settings, settings);

			// If the call is a fixture call, we run the same type of code as we would
			// with jQuery's ajaxTransport.
			if (settings.fixture) {
				var timeout, deferred = new can.Deferred(),
					stopped = false;

				//TODO this should work with response
				deferred.getResponseHeader = function () {};

				// Call success or fail after deferred resolves
				deferred.then(settings.success, settings.fail);

				// Abort should stop the timeout and calling the success callback
				deferred.abort = function () {
					clearTimeout(timeout);
					stopped = true;
					deferred.reject(deferred);
				};
				// set a timeout that simulates making a request ....
				timeout = setTimeout(function () {
					// if the user wants to call success on their own, we allow it ...
					var success = function () {
						var response = extractResponse.apply(settings, arguments),
							status = response[0];

						if ((status >= 200 && status < 300 || status === 304) && stopped === false) {
							deferred.resolve(response[2][settings.dataType]);
						} else {
							// TODO probably resolve better
							deferred.reject(deferred, 'error', response[1]);
						}
					},
						// Get the results from the fixture.
						result = settings.fixture(settings, success, settings.headers, settings);
					if (result !== undefined) {
						// Resolve with fixture results
						deferred.resolve(result);
					}
				}, can.fixture.delay);

				return deferred;
				// Otherwise just run a normal can.ajax call.
			} else {
				return AJAX(settings);
			}
		};
	}

	// A list of 'overwrite' settings objects
	var overwrites = [],
		// Finds and returns the index of an overwrite function
		find = function (settings, exact) {
			for (var i = 0; i < overwrites.length; i++) {
				if ($fixture._similar(settings, overwrites[i], exact)) {
					return i;
				}
			}
			return -1;
		},
		// Overwrites the settings fixture if an overwrite matches
		overwrite = function (settings) {
			var index = find(settings);
			if (index > -1) {
				settings.fixture = overwrites[index].fixture;
				return $fixture._getData(overwrites[index].url, settings.url);
			}

		},
		// Attemps to guess where the id is in an AJAX call's URL and returns it.
		getId = function (settings) {
			var id = settings.data.id;

			if (id === undefined && typeof settings.data === "number") {
				id = settings.data;
			}

			// Parses the URL looking for all digits
			if (id === undefined) {
				// Set id equal to the value
				settings.url.replace(/\/(\d+)(\/|$|\.)/g, function (all, num) {
					id = num;
				});
			}

			if (id === undefined) {
				// If that doesn't work Parses the URL looking for all words
				id = settings.url.replace(/\/(\w+)(\/|$|\.)/g, function (all, num) {
					// As long as num isn't the word "update", set id equal to the value
					if (num !== 'update') {
						id = num;
					}
				});
			}

			if (id === undefined) {
				// If id is still not set, a random number is guessed.
				id = Math.round(Math.random() * 1000);
			}

			return id;
		};

	// ## can.fixture
	// Simulates AJAX requests.
	var $fixture = can.fixture = function (settings, fixture) {
		// If fixture is provided, set up a new fixture.
		if (fixture !== undefined) {
			if (typeof settings === 'string') {
				// Match URL if it has GET, POST, PUT, or DELETE.
				var matches = settings.match(/(GET|POST|PUT|DELETE) (.+)/i);
				// If not, we don't set the type, which eventually defaults to GET
				if (!matches) {
					settings = {
						url: settings
					};
					// If it does match, we split the URL in half and create an object with
					// each half as the url and type properties.
				} else {
					settings = {
						url: matches[2],
						type: matches[1]
					};
				}
			}

			// Check if the same fixture was previously added, if so, we remove it
			// from our array of fixture overwrites.
			var index = find(settings, !! fixture);
			if (index > -1) {
				overwrites.splice(index, 1);
			}
			if (fixture == null) {
				return;
			}
			settings.fixture = fixture;
			overwrites.push(settings);
			// If a fixture isn't provided, we assume that settings is
			// an array of fixtures, and we should iterate over it, and set up
			// the new fixtures.
		} else {
			can.each(settings, function (fixture, url) {
				$fixture(url, fixture);
			});
		}
	};
	var replacer = can.replacer;

	can.extend(can.fixture, {
		// Find an overwrite, given some ajax settings.
		_similar: function (settings, overwrite, exact) {
			if (exact) {
				return can.Object.same(settings, overwrite, {
					fixture: null
				});
			} else {
				return can.Object.subset(settings, overwrite, can.fixture._compare);
			}
		},
		// Comparator object used to find a similar overwrite.
		_compare: {
			url: function (a, b) {
				return !!$fixture._getData(b, a);
			},
			fixture: null,
			type: "i"
		},
		// Returns data from a url, given a fixtue URL. For example, given
		// "todo/{id}" and "todo/5", it will return an object with an id property
		// equal to 5.
		_getData: function (fixtureUrl, url) {
			var order = [],
				// Sanitizes fixture URL
				fixtureUrlAdjusted = fixtureUrl.replace('.', '\\.')
					.replace('?', '\\?'),
				// Creates a regular expression out of the adjusted fixture URL and
				// runs it on the URL we passed in.
				res = new RegExp(fixtureUrlAdjusted.replace(replacer, function (whole, part) {
					order.push(part);
					return "([^\/]+)";
				}) + "$")
					.exec(url),
				data = {};

			// If there were no matches, return null;
			if (!res) {
				return null;
			}

			// Shift off the URL and just keep the data.
			res.shift();
			can.each(order, function (name) {
				// Add data from regular expression onto data object.
				data[name] = res.shift();
			});
			return data;
		},
		// ## can.fixture.store
		// Make a store of objects to use when making requests against fixtures.
		store: function (count, make, filter) {
			/*jshint eqeqeq:false */
			
			// the currentId to use when a new instance is created.
			var	currentId = 0,
				findOne = function (id) {
					for (var i = 0; i < items.length; i++) {
						if (id == items[i].id) {
							return items[i];
						}
					}
				},
				methods = {},
				types,
				items,
				reset;
				
			if(can.isArray(count) && typeof count[0] === "string" ){
				types = count;
				count = make;
				make= filter;
				filter = arguments[3];
			} else if(typeof count === "string") {
				types = [count + "s", count];
				count = make;
				make= filter;
				filter = arguments[3];
			}
			
			
			if(typeof count === "number") {
				items = [];
				reset = function () {
					items = [];
					for (var i = 0; i < (count); i++) {
						//call back provided make
						var item = make(i, items);
	
						if (!item.id) {
							item.id = i;
						}
						currentId = Math.max(item.id + 1, currentId + 1) || items.length;
						items.push(item);
					}
					if (can.isArray(types)) {
						can.fixture["~" + types[0]] = items;
						can.fixture["-" + types[0]] = methods.findAll;
						can.fixture["-" + types[1]] = methods.findOne;
						can.fixture["-" + types[1] + "Update"] = methods.update;
						can.fixture["-" + types[1] + "Destroy"] = methods.destroy;
						can.fixture["-" + types[1] + "Create"] = methods.create;
					}
				};
			} else {
				filter = make;
				var initialItems = count;
				reset = function(){
					items = initialItems.slice(0);
				};
			}
			

			// make all items
			can.extend(methods, {
				findAll: function (request) {
					request = request || {};
					//copy array of items
					var retArr = items.slice(0);
					request.data = request.data || {};
					//sort using order
					//order looks like ["age ASC","gender DESC"]
					can.each((request.data.order || [])
						.slice(0)
						.reverse(), function (name) {
							var split = name.split(" ");
							retArr = retArr.sort(function (a, b) {
								if (split[1].toUpperCase() !== "ASC") {
									if (a[split[0]] < b[split[0]]) {
										return 1;
									} else if (a[split[0]] === b[split[0]]) {
										return 0;
									} else {
										return -1;
									}
								} else {
									if (a[split[0]] < b[split[0]]) {
										return -1;
									} else if (a[split[0]] === b[split[0]]) {
										return 0;
									} else {
										return 1;
									}
								}
							});
						});

					//group is just like a sort
					can.each((request.data.group || [])
						.slice(0)
						.reverse(), function (name) {
							var split = name.split(" ");
							retArr = retArr.sort(function (a, b) {
								return a[split[0]] > b[split[0]];
							});
						});

					var offset = parseInt(request.data.offset, 10) || 0,
						limit = parseInt(request.data.limit, 10) || (items.length - offset),
						i = 0;

					//filter results if someone added an attr like parentId
					for (var param in request.data) {
						i = 0;
						if (request.data[param] !== undefined && // don't do this if the value of the param is null (ignore it)
							(param.indexOf("Id") !== -1 || param.indexOf("_id") !== -1)) {
							while (i < retArr.length) {
								if (request.data[param] != retArr[i][param]) { // jshint eqeqeq: false
									retArr.splice(i, 1);
								} else {
									i++;
								}
							}
						}
					}

					if ( typeof filter === "function" ) {
						i = 0;
						while (i < retArr.length) {
							if (!filter(retArr[i], request)) {
								retArr.splice(i, 1);
							} else {
								i++;
							}
						}
					} else if( typeof filter === "object" ) {
						i = 0;
						while (i < retArr.length) {
							if ( !can.Object.subset(retArr[i], request.data, filter) ) {
								retArr.splice(i, 1);
							} else {
								i++;
							}
						}
					}

					// Return the data spliced with limit and offset, along with related values
					// (e.g. count, limit, offset)
					return {
						"count": retArr.length,
						"limit": request.data.limit,
						"offset": request.data.offset,
						"data": retArr.slice(offset, offset + limit)
					};
				},

				/**
				 * @description Simulate a findOne request on a fixture.
				 * @function can.fixture.types.Store.findOne
				 * @parent can.fixture.types.Store
				 * @signature `store.findOne(request, response)`
				 * @param {Object} request Parameters for the request.
				 * @param {Function} response A function to call with the retrieved item.
				 *
				 * @body
				 * `store.findOne(request, response(item))` simulates a request to
				 * get a single item from the server by id.
				 *
				 *     todosStore.findOne({
				 *       url: "/todos/5"
				 *     }, function(todo){
				 *
				 *     });
				 *
				 */
				findOne: function (request, response) {
					var item = findOne(getId(request));
					
					if(typeof item === "undefined") {
						return response(404, 'Requested resource not found');
					}

					response(item);
				},
				// ## fixtureStore.update
				// Simulates a can.Model.update to a fixture
				update: function (request, response) {
					var id = getId(request),
						item = findOne(id);

					if(typeof item === "undefined") {
						return response(404, 'Requested resource not found');
					}

					// TODO: make it work with non-linear ids ..
					can.extend(item, request.data);
					response({
						id: id
					}, {
						location: request.url || "/" + getId(request)
					});
				},

				/**
				 * @description Simulate destroying a Model on a fixture.
				 * @function can.fixture.types.Store.destroy
				 * @parent can.fixture.types.Store
				 * @signature `store.destroy(request, callback)`
				 * @param {Object} request Parameters for the request.
				 * @param {Function} callback A function to call after destruction.
				 *
				 * @body
				 * `store.destroy(request, response())` simulates
				 * a request to destroy an item from the server.
				 *
				 * ```
				 * todosStore.destroy({
				 *   url: "/todos/5"
				 * }, function(){});
				 * ```
				 */
				destroy: function (request, response) {
					var id = getId(request),
						item = findOne(id);
						
					if(typeof item === "undefined") {
						return response(404, 'Requested resource not found');
					}

					for (var i = 0; i < items.length; i++) {
						if (items[i].id == id) {  // jshint eqeqeq: false
							items.splice(i, 1);
							break;
						}
					}

					// TODO: make it work with non-linear ids ..
					return {};
				},

				// ## fixtureStore.create
				// Simulates a can.Model.create to a fixture
				create: function (settings, response) {
					var item = typeof make === 'function' ? make(items.length, items) : {};

					can.extend(item, settings.data);

					// If an ID wasn't passed into the request, we give the item
					// a unique ID.
					if (!item.id) {
						item.id = currentId++;
					}

					// Push the new item into the store.
					items.push(item);
					response({
						id: item.id
					}, {
						location: settings.url + "/" + item.id
					});
				}
			});
			reset();
			// if we have types given add them to can.fixture

			return can.extend({
				getId: getId,
				find: function (settings) {
					return findOne(getId(settings));
				},
				reset: reset
			}, methods);
		},
		rand: function randomize(arr, min, max) {
			if (typeof arr === 'number') {
				if (typeof min === 'number') {
					return arr + Math.floor(Math.random() * (min - arr));
				} else {
					return Math.floor(Math.random() * arr);
				}

			}
			var rand = randomize;
			// get a random set
			if (min === undefined) {
				return rand(arr, rand(arr.length + 1));
			}
			// get a random selection of arr
			var res = [];
			arr = arr.slice(0);
			// set max
			if (!max) {
				max = min;
			}
			//random max
			max = min + Math.round(rand(max - min));
			for (var i = 0; i < max; i++) {
				res.push(arr.splice(rand(arr.length), 1)[0]);
			}
			return res;
		},
		xhr: function (xhr) {
			return can.extend({}, {
				abort: can.noop,
				getAllResponseHeaders: function () {
					return "";
				},
				getResponseHeader: function () {
					return "";
				},
				open: can.noop,
				overrideMimeType: can.noop,
				readyState: 4,
				responseText: "",
				responseXML: null,
				send: can.noop,
				setRequestHeader: can.noop,
				status: 200,
				statusText: "OK"
			}, xhr);
		},
		on: true
	});

	// ## can.fixture.delay
	// The delay, in milliseconds, between an AJAX request being made and when
	// the success callback gets called.
	can.fixture.delay = 200;

	// ## can.fixture.rootUrl
	// The root URL which fixtures will use.
	can.fixture.rootUrl = getUrl('');

	can.fixture["-handleFunction"] = function (settings) {
		if (typeof settings.fixture === "string" && can.fixture[settings.fixture]) {
			settings.fixture = can.fixture[settings.fixture];
		}
		if (typeof settings.fixture === "function") {
			setTimeout(function () {
				if (settings.success) {
					settings.success.apply(null, settings.fixture(settings, "success"));
				}
				if (settings.complete) {
					settings.complete.apply(null, settings.fixture(settings, "complete"));
				}
			}, can.fixture.delay);
			return true;
		}
		return false;
	};

	//Expose this for fixture debugging
	can.fixture.overwrites = overwrites;
	can.fixture.make = can.fixture.store;
	return can.fixture;
});

