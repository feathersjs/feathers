/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#model/model*/
steal('can/util', 'can/map', 'can/list', function (can) {
	/** @add can.Model **/
	// ## model.js
	// (Don't steal this file directly in your code.)

	// ## pipe
	// `pipe` lets you pipe the results of a successful deferred
	// through a function before resolving the deferred.
	var pipe = function (def, thisArg, func) {
		// The piped result will be available through a new Deferred.
		var d = new can.Deferred();
		def.then(function () {
			var args = can.makeArray(arguments),
				success = true;

			try {
				// Pipe the results through the function.
				args[0] = func.apply(thisArg, args);
			} catch (e) {
				success = false;
				// The function threw an error, so reject the Deferred.
				d.rejectWith(d, [e].concat(args));
			}
			if (success) {
				// Resolve the new Deferred with the piped value.
				d.resolveWith(d, args);
			}
		}, function () {
			// Pass on the rejection if the original Deferred never resolved.
			d.rejectWith(this, arguments);
		});

		// `can.ajax` returns a Deferred with an abort method to halt the AJAX call.
		if (typeof def.abort === 'function') {
			d.abort = function () {
				return def.abort();
			};
		}

		// Return the new (piped) Deferred.
		return d;
	},

		// ## modelNum
		// When new model constructors are set up without a full name,
		// `modelNum` lets us name them uniquely (to keep track of them).
		modelNum = 0,

		// ## getId
		getId = function (inst) {
			// `can.__observe` makes a note that `id` was just read.
			can.__observe(inst, inst.constructor.id);
			// Use `__get` instead of `attr` for performance. (But that means we have to remember to call `can.__observe`.)
			return inst.__get(inst.constructor.id);
		},

		// ## ajax
		// This helper method makes it easier to make an AJAX call from the configuration of the Model.
		ajax = function (ajaxOb, data, type, dataType, success, error) {

			var params = {};

			// A string here would be something like `"GET /endpoint"`.
			if (typeof ajaxOb === 'string') {
				// Split on spaces to separate the HTTP method and the URL.
				var parts = ajaxOb.split(/\s+/);
				params.url = parts.pop();
				if (parts.length) {
					params.type = parts.pop();
				}
			} else {
				// If the first argument is an object, just load it into `params`.
				can.extend(params, ajaxOb);
			}

			// If the `data` argument is a plain object, copy it into `params`.
			params.data = typeof data === "object" && !can.isArray(data) ?
				can.extend(params.data || {}, data) : data;

			// Substitute in data for any templated parts of the URL.
			params.url = can.sub(params.url, params.data, true);

			return can.ajax(can.extend({
				type: type || 'post',
				dataType: dataType || 'json',
				success: success,
				error: error
			}, params));
		},

		// ## makeRequest
		// This function abstracts making the actual AJAX request away from the Model.
		makeRequest = function (modelObj, type, success, error, method) {
			var args;

			// If `modelObj` is an Array, it it means we are coming from
			// the queued request, and we're passing already-serialized data.
			if (can.isArray(modelObj)) {
				// In that case, modelObj's signature will be `[modelObj, serializedData]`, so we need to unpack it.
				args = modelObj[1];
				modelObj = modelObj[0];
			} else {
				// If we aren't supplied with serialized data, we'll make our own.
				args = modelObj.serialize();
			}
			args = [args];

			var deferred,
				model = modelObj.constructor,
				jqXHR;

			// When calling `update` and `destroy`, the current ID needs to be the first parameter in the AJAX call.
			if (type === 'update' || type === 'destroy') {
				args.unshift(getId(modelObj));
			}
			jqXHR = model[type].apply(model, args);

			// Make sure that can.Model can react to the request before anything else does.
			deferred = pipe(jqXHR, modelObj, function (data) {
				// `method` is here because `"destroyed" !== "destroy" + "d"`.
				// TODO: Do something smarter/more consistent here?
				modelObj[method || type + "d"](data, jqXHR);
				return modelObj;
			});

			// Hook up `abort`
			if (jqXHR.abort) {
				deferred.abort = function () {
					jqXHR.abort();
				};
			}

			deferred.then(success, error);
			return deferred;
		},

		converters = {
			// ## models
			// The default function for converting into a list of models. Needs to be stored separate
			// because we will reference it in models static `setup`, too.
			models: function (instancesRawData, oldList, xhr) {
				// Increment reqs counter so new instances will be added to the store.
				// (This is cleaned up at the end of the method.)
				can.Model._reqs++;

				// If there is no data, we can't really do anything with it.
				if (!instancesRawData) {
					return;
				}

				// If the "raw" data is already a List, it's not raw.
				if (instancesRawData instanceof this.List) {
					return instancesRawData;
				}

				var self = this,
					// `tmp` will hold the models before we push them onto `modelList`.
					tmp = [],
					// `ML` (see way below) is just `can.Model.List`.
					ListClass = self.List || ML,
					modelList = oldList instanceof can.List ? oldList : new ListClass(),

					// Check if we were handed an Array or a model list.
					rawDataIsList = instancesRawData instanceof ML,

					// Get the "plain" objects from the models from the list/array.
					raw = rawDataIsList ? instancesRawData.serialize() : instancesRawData;

				raw = self.parseModels(raw, xhr);

				if(raw.data) {
					instancesRawData = raw;
					raw = raw.data;
				}

				if (typeof raw === 'undefined' || !can.isArray(raw)) {
					throw new Error('Could not get any raw data while converting using .models');
				}

				//!steal-remove-start
				if (!raw.length) {
					can.dev.warn("model.js models has no data.");
				}
				//!steal-remove-end

				// If there was anything left in the list we were given, get rid of it.
				if (modelList.length) {
					modelList.splice(0);
				}

				// If we pushed these directly onto the list, it would cause a change event for each model.
				// So, we push them onto `tmp` first and then push everything at once, causing one atomic change event that contains all the models at once.
				can.each(raw, function (rawPart) {
					tmp.push(self.model(rawPart, xhr));
				});
				modelList.push.apply(modelList, tmp);

				// If there was other stuff on `instancesRawData`, let's transfer that onto `modelList` too.
				if (!can.isArray(instancesRawData)) {
					can.each(instancesRawData, function (val, prop) {
						if (prop !== 'data') {
							modelList.attr(prop, val);
						}
					});
				}
				// Clean up the store on the next turn of the event loop. (`this` is a model constructor.)
				setTimeout(can.proxy(this._clean, this), 1);
				return modelList;
			},
			// ## model
			// A function that, when handed a plain object, turns it into a model.
			model: function (attributes, oldModel, xhr) {
				// If there're no properties, there can be no model.
				if (!attributes) {
					return;
				}

				// If this object knows how to serialize, parse, or access itself, we'll use that instead.
				if (typeof attributes.serialize === 'function') {
					attributes = attributes.serialize();
				} else {
					attributes = this.parseModel(attributes, xhr);
				}

				var id = attributes[this.id];
				// Models from the store always have priority
				// 0 is a valid ID.
				if((id || id === 0) && this.store[id]) {
					oldModel = this.store[id];
				}

				var model = oldModel && can.isFunction(oldModel.attr) ?
						// If this model is in the store already, just update it.
						oldModel.attr(attributes, this.removeAttr || false) :
						// Otherwise, we need a new model.
						new this(attributes);

				return model;
			}
		},

		// ## makeParser
		// This object describes how to take the data from an AJAX request and prepare it for `models` and `model`.
		// These functions are meant to be overwritten (if necessary) in an extended model constructor.
		makeParser = {
			parseModel: function (prop) {
				return function (attributes) {
					return prop ? can.getObject(prop, attributes) : attributes;
				};
			},
			parseModels: function (prop) {
				return function (attributes) {
					if(can.isArray(attributes)) {
						return attributes;
					}

					prop = prop || 'data';

					var result = can.getObject(prop, attributes);
					if(!can.isArray(result)) {
						throw new Error('Could not get any raw data while converting using .models');
					}
					return result;
				};
			}
		},

		// ## ajaxMethods
		// This object describes how to make an AJAX request for each ajax method (`create`, `update`, etc.)
		// Each AJAX method is an object in `ajaxMethods` and can have the following properties:
		//
		// - `url`: Which property on the model contains the default URL for this method.
		// - `type`: The default HTTP request method.
		// - `data`: A method that takes the arguments from `makeRequest` (see above) and returns a data object for use in the AJAX call.
		ajaxMethods = {
			create: {
				url: "_shortName",
				type: "post"
			},
			update: {
				// ## update.data
				data: function (id, attrs) {
					attrs = attrs || {};

					// `this.id` is the property that represents the ID (and is usually `"id"`).
					var identity = this.id;

					// If the value of the property being used as the ID changed,
					// indicate that in the request and replace the current ID property.
					if (attrs[identity] && attrs[identity] !== id) {
						attrs["new" + can.capitalize(id)] = attrs[identity];
						delete attrs[identity];
					}
					attrs[identity] = id;

					return attrs;
				},
				type: "put"
			},
			destroy: {
				type: 'delete',
				// ## destroy.data
				data: function (id, attrs) {
					attrs = attrs || {};
					// `this.id` is the property that represents the ID (and is usually `"id"`).
					attrs.id = attrs[this.id] = id;
					return attrs;
				}
			},
			findAll: {
				url: "_shortName"
			},
			findOne: {}
		},
		// ## ajaxMaker
		// Takes a method defined just above and a string that describes how to call that method
		// and makes a function that calls that method with the given data.
		//
		// - `ajaxMethod`: The object defined above in `ajaxMethods`.
		// - `str`: The string the configuration provided (such as `"/recipes.json"` for a `findAll` call).
		ajaxMaker = function (ajaxMethod, str) {
			return function (data) {
				data = ajaxMethod.data ?
					// If the AJAX method mentioned above has its own way of getting `data`, use that.
					ajaxMethod.data.apply(this, arguments) :
					// Otherwise, just use the data passed in.
					data;

				// Make the AJAX call with the URL, data, and type indicated by the proper `ajaxMethod` above.
				return ajax(str || this[ajaxMethod.url || "_url"], data, ajaxMethod.type || "get");
			};
		},
		// ## createURLFromResource
		// For each of the names (create, update, destroy, findOne, and findAll) use the
		// URL provided by the `resource` property. For example:
		//
		// 		ToDo = can.Model.extend({
		// 			resource: "/todos"
		// 		}, {});
		//
		// 	Will create a can.Model that is identical to:
		//
		// 		ToDo = can.Model.extend({
		// 			findAll: "GET /todos",
		// 			findOne: "GET /todos/{id}",
		// 			create:  "POST /todos",
		// 			update:  "PUT /todos/{id}",
		// 			destroy: "DELETE /todos/{id}"
		// 		},{});
		//
		// - `model`: the can.Model that has the resource property
		// - `method`: a property from the ajaxMethod object
		createURLFromResource = function(model, name) {
			if (!model.resource) { return; }

			var resource = model.resource.replace(/\/+$/, "");
			if (name === "findAll" || name === "create") {
				return resource;
			} else {
				return resource + "/{" + model.id + "}";
			}
		};

	// # can.Model
	// A can.Map that connects to a RESTful interface.
	/** @static */
	can.Model = can.Map.extend({
			// `fullName` identifies the model type in debugging.
			fullName: "can.Model",
			_reqs: 0,
			// ## can.Model.setup
			setup: function (base, fullName, staticProps, protoProps) {
				// Assume `fullName` wasn't passed. (`can.Model.extend({ ... }, { ... })`)
				// This is pretty usual.
				if (typeof fullName !== "string") {
					protoProps = staticProps;
					staticProps = fullName;
				}
				// Assume no static properties were passed. (`can.Model.extend({ ... })`)
				// This is really unusual for a model though, since there's so much configuration.
				if (!protoProps) {
					//!steal-remove-start
					can.dev.warn("can/model/model.js: can.Model extended without static properties.");
					//!steal-remove-end
					protoProps = staticProps;
				}

				// Create the model store here, in case someone wants to use can.Model without inheriting from it.
				this.store = {};

				can.Map.setup.apply(this, arguments);
				if (!can.Model) {
					return;
				}

				// `List` is just a regular can.Model.List that knows what kind of Model it's hooked up to.
				if(staticProps && staticProps.List) {
					this.List = staticProps.List;
					this.List.Map = this;
				} else {
					this.List = base.List.extend({
						Map: this
					}, {});
				}

				var self = this,
					clean = can.proxy(this._clean, self);

				// Go through `ajaxMethods` and set up static methods according to their configurations.
				can.each(ajaxMethods, function (method, name) {
					// Check the configuration for this ajaxMethod.
					// If the configuration isn't a function, it should be a string (like `"GET /endpoint"`)
					// or an object like `{url: "/endpoint", type: 'GET'}`.

					//if we have a string(like `"GET /endpoint"`) or an object(ajaxSettings) set in the static definition(not inherited),
					//convert it to a function.
					if(staticProps && staticProps[name] && (typeof staticProps[name] === 'string' || typeof staticProps[name] === 'object')) {
						self[name] = ajaxMaker(method, staticProps[name]);
					}
					//if we have a resource property set in the static definition, but check if function exists already
					else if(staticProps && staticProps.resource && !can.isFunction(staticProps[name])) {
						self[name] = ajaxMaker(method, createURLFromResource(self, name));
					}

					// There may also be a "maker" function (like `makeFindAll`) that alters the behavior of acting upon models
					// by changing when and how the function we just made with `ajaxMaker` gets called.
					// For example, you might cache responses and only make a call when you don't have a cached response.
					if (self["make" + can.capitalize(name)]) {
						// Use the "maker" function to make the new "ajaxMethod" function.
						var newMethod = self["make" + can.capitalize(name)](self[name]);
						// Replace the "ajaxMethod" function in the configuration with the new one.
						// (`_overwrite` just overwrites a property in a given Construct.)
						can.Construct._overwrite(self, base, name, function () {
							// Increment the numer of requests...
							can.Model._reqs++;
							// ...make the AJAX call (and whatever else you're doing)...
							var def = newMethod.apply(this, arguments);
							// ...and clean up the store.
							var then = def.then(clean, clean);
							// Pass along `abort` so you can still abort the AJAX call.
							then.abort = def.abort;

							return then;
						});
					}
				});

				var hasCustomConverter = {};

				// Set up `models` and `model`.
				can.each(converters, function(converter, name) {
					var parseName = "parse" + can.capitalize(name),
						dataProperty = (staticProps && staticProps[name]) || self[name];

					// For legacy e.g. models: 'someProperty' we set the `parseModel(s)` property
					// to the given string and set .model(s) to the original converter
					if(typeof dataProperty === 'string') {
						self[parseName] = dataProperty;
						can.Construct._overwrite(self, base, name, converter);
					} else if((staticProps && staticProps[name])) {
						hasCustomConverter[parseName] = true;
					}
				});

				// Sets up parseModel(s)
				can.each(makeParser, function(maker, parseName) {
					var prop = (staticProps && staticProps[parseName]) || self[parseName];
					// e.g. parseModels: 'someProperty' make a default parseModel(s)
					if(typeof prop === 'string') {
						can.Construct._overwrite(self, base, parseName, maker(prop));
					} else if( (!staticProps || !can.isFunction(staticProps[parseName])) && !self[parseName] ) {
						var madeParser = maker();
						madeParser.useModelConverter = hasCustomConverter[parseName];
						// Add a default parseModel(s) if there is none
						can.Construct._overwrite(self, base, parseName, madeParser);
					}
				});

				// Make sure we have a unique name for this Model.
				if (self.fullName === "can.Model" || !self.fullName) {
					self.fullName = "Model" + (++modelNum);
				}

				can.Model._reqs = 0;
				this._url = this._shortName + "/{" + this.id + "}";
			},
			_ajax: ajaxMaker,
			_makeRequest: makeRequest,
			// ## can.Model._clean
			// `_clean` cleans up the model store after a request happens.
			_clean: function () {
				can.Model._reqs--;
				// Don't clean up unless we have no pending requests.
				if (!can.Model._reqs) {
					for (var id in this.store) {
						// Delete all items in the store without any event bindings.
						if (!this.store[id]._bindings) {
							delete this.store[id];
						}
					}
				}
				return arguments[0];
			},
			models: converters.models,
			model: converters.model
		},
		/** @prototype */
		{
			// ## can.Model#setup
			setup: function (attrs) {
				// Try to add things as early as possible to the store (#457).
				// This is the earliest possible moment, even before any properties are set.
				var id = attrs && attrs[this.constructor.id];
				if (can.Model._reqs && id != null) {
					this.constructor.store[id] = this;
				}
				can.Map.prototype.setup.apply(this, arguments);
			},
			// ## can.Model#isNew
			// Something is new if its ID is `null` or `undefined`.
			isNew: function () {
				var id = getId(this);
				// 0 is a valid ID.
				// TODO: Why not `return id === null || id === undefined;`?
				return !(id || id === 0); // If `null` or `undefined`
			},
			// ## can.Model#save
			// `save` calls `create` or `update` as necessary, based on whether a model is new.
			save: function (success, error) {
				return makeRequest(this, this.isNew() ? 'create' : 'update', success, error);
			},
			// ## can.Model#destroy
			// Acts like can.Map.destroy but it also makes an AJAX call.
			destroy: function (success, error) {
				// If this model is new, don't make an AJAX call.
				// Instead, we have to construct the Deferred ourselves and return it.
				if (this.isNew()) {
					var self = this;
					var def = can.Deferred();
					def.then(success, error);

					return def.done(function (data) {
						self.destroyed(data);
					}).resolve(self);
				}

				// If it isn't new, though, go ahead and make a request.
				return makeRequest(this, 'destroy', success, error, 'destroyed');
			},
			// ## can.Model#bind and can.Model#unbind
			// These aren't actually implemented here, but their setup needs to be changed to account for the store.
			_bindsetup: function () {
				var modelInstance = this.__get(this.constructor.id);
				if (modelInstance != null) {
					this.constructor.store[modelInstance ] = this;
				}
				return can.Map.prototype._bindsetup.apply(this, arguments);
			},
			_bindteardown: function () {
				delete this.constructor.store[getId(this)];
				return can.Map.prototype._bindteardown.apply(this, arguments);
			},
			// Change the behavior of `___set` to account for the store.
			___set: function (prop, val) {
				can.Map.prototype.___set.call(this, prop, val);
				// If we add or change the ID, update the store accordingly.
				// TODO: shouldn't this also delete the record from the old ID in the store?
				if (prop === this.constructor.id && this._bindings) {
					this.constructor.store[getId(this)] = this;
				}
			}
		});

	// Returns a function that knows how to prepare data from `findAll` or `findOne` calls.
	// `name` should be either `model` or `models`.
	var makeGetterHandler = function (name) {
		return function (data, readyState, xhr) {
			return this[name](data, null, xhr);
		};
	},
	// Handle data returned from `create`, `update`, and `destroy` calls.
	createUpdateDestroyHandler = function (data) {
		if(this.parseModel.useModelConverter) {
			return this.model(data);
		}

		return this.parseModel(data);
	};

	var responseHandlers = {
		makeFindAll: makeGetterHandler("models"),
		makeFindOne: makeGetterHandler("model"),
		makeCreate: createUpdateDestroyHandler,
		makeUpdate: createUpdateDestroyHandler,
		makeDestroy: createUpdateDestroyHandler
	};

	// Go through the response handlers and make the actual "make" methods.
	can.each(responseHandlers, function (method, name) {
		can.Model[name] = function (oldMethod) {
			return function () {
				var args = can.makeArray(arguments),
					// If args[1] is a function, we were only passed one argument before success and failure callbacks.
					oldArgs = can.isFunction(args[1]) ? args.splice(0, 1) : args.splice(0, 2),
					// Call the AJAX method (`findAll` or `update`, etc.) and pipe it through the response handler from above.
					def = pipe(oldMethod.apply(this, oldArgs), this, method);

				def.then(args[0], args[1]);
				return def;
			};
		};
	});

	// ## can.Model.created, can.Model.updated, and can.Model.destroyed
	// Livecycle methods for models.
	can.each([
		"created",
		"updated",
		"destroyed"
	], function (funcName) {
		// Each of these is pretty much the same, except for the events they trigger.
		can.Model.prototype[funcName] = function (attrs) {
			var self = this,
				constructor = self.constructor;

			// Update attributes if attributes have been passed
			if(attrs && typeof attrs === 'object') {
				this.attr(can.isFunction(attrs.attr) ? attrs.attr() : attrs);
			}

			// triggers change event that bubble's like
			// handler( 'change','1.destroyed' ). This is used
			// to remove items on destroyed from Model Lists.
			// but there should be a better way.
			can.dispatch.call(this, {type:"change", target: this}, [funcName]);

			//!steal-remove-start
			can.dev.log("Model.js - " + constructor.shortName + " " + funcName);
			//!steal-remove-end

			// Call event on the instance's Class
			can.dispatch.call(constructor, funcName, [this]);
		};
	});


	// # can.Model.List
	// Model Lists are just like `Map.List`s except that when their items are
	// destroyed, they automatically get removed from the List.
	var ML = can.Model.List = can.List.extend({
		// ## can.Model.List.setup
		// On change or a nested named event, setup change bubbling.
		// On any other type of event, setup "destroyed" bubbling.
		_bubbleRule: function(eventName, list) {
			var bubbleRules = can.List._bubbleRule(eventName, list);
			bubbleRules.push('destroyed');
			return bubbleRules;
		}
	},{
		setup: function (params) {
			// If there was a plain object passed to the List constructor,
			// we use those as parameters for an initial findAll.
			if (can.isPlainObject(params) && !can.isArray(params)) {
				can.List.prototype.setup.apply(this);
				this.replace(can.isDeferred(params) ? params : this.constructor.Map.findAll(params));
			} else {
				// Otherwise, set up the list like normal.
				can.List.prototype.setup.apply(this, arguments);
			}
			this._init = 1;
			this.bind('destroyed', can.proxy(this._destroyed, this));
			delete this._init;
		},
		_destroyed: function (ev, attr) {
			if (/\w+/.test(attr)) {
				var index;
				while((index = this.indexOf(ev.target)) > -1) {
					this.splice(index, 1);
				}
			}
		}
	});

	return can.Model;
});

