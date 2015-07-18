/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#component/component*/
// # can/component/component.js
// 
// This implements the `can.Component` which allows you to create widgets 
// that use a template, a view-model and custom tags.
// 
// `can.Component` implements most of it's functionality in the `can.Component.setup`
// and the `can.Component.prototype.setup` functions.
// 
// `can.Component.setup` prepares everything needed by the `can.Component.prototype.setup` 
// to hookup the component.

steal("can/util", "can/view/callbacks","can/view/elements.js","can/control", "can/observe", "can/view/mustache", "can/view/bindings", function (can, viewCallbacks, elements) {
	// ## Helpers
	// Attribute names to ignore for setting viewModel values.
	var ignoreAttributesRegExp = /^(dataViewId|class|id)$/i,
		paramReplacer = /\{([^\}]+)\}/g;

	/**
	 * @add can.Component
	 */
	var Component = can.Component = can.Construct.extend(
		
		// ## Static
		/**
		 * @static
		 */
		
		{
			// ### setup
			// 
			// When a component is extended, this sets up the component's internal constructor
			// functions and templates for later fast initialization.
			setup: function () {
				can.Construct.setup.apply(this, arguments);

				// When `can.Component.setup` function is ran for the first time, `can.Component` doesn't exist yet 
				// which ensures that the following code is ran only in constructors that extend `can.Component`. 
				if (can.Component) {
					var self = this,
						scope = this.prototype.scope || this.prototype.viewModel;
					
					// Define a control using the `events` prototype property.
					this.Control = ComponentControl.extend( this.prototype.events );
					
					// Look to convert `scope` to a Map constructor function.
					if (!scope || (typeof scope === "object" && ! (scope instanceof can.Map)  ) ) {
						// If scope is an object, use that object as the prototype of an extended 
						// Map constructor function.
						// A new instance of that Map constructor function will be created and
						// set a the constructor instance's viewModel.
						this.Map = can.Map.extend(scope || {});
					}
					else if (scope.prototype instanceof can.Map) {
						// If viewModel is a can.Map constructor function, just use that.
						this.Map = scope;
					}
					
					// Look for default `@` values. If a `@` is found, these
					// attributes string values will be set and 2-way bound on the
					// component instance's viewModel.
					this.attributeScopeMappings = {};
					can.each(this.Map ? this.Map.defaults : {}, function (val, prop) {
						if (val === "@") {
							self.attributeScopeMappings[prop] = prop;
						}
					});

					// Convert the template into a renderer function.
					if (this.prototype.template) {
						// If `this.prototype.template` is a function create renderer from it by
						// wrapping it with the anonymous function that will pass it the arguments,
						// otherwise create the render from the string
						if (typeof this.prototype.template === "function") {
							var temp = this.prototype.template;
							this.renderer = function () {
								return can.view.frag(temp.apply(null, arguments));
							};
						} else {
							this.renderer = can.view.mustache(this.prototype.template);
						}
					}

					// Register this component to be created when its `tag` is found.
					can.view.tag(this.prototype.tag, function (el, options) {
						new self(el, options);
					});
				}

			}
		}, {
			// ## Prototype
			/**
			 * @prototype
			 */
			// ### setup
			// When a new component instance is created, setup bindings, render the template, etc.
			setup: function (el, hookupOptions) {
				// Setup values passed to component
				var initialScopeData = {},
					component = this,
					// If a template is not provided, we fall back to
					// dynamic scoping regardless of settings.
					lexicalContent = ((typeof this.leakScope === "undefined" ?
									   false :
									   !this.leakScope) &&
									  this.template),
					twoWayBindings = {},
					scope = this.scope || this.viewModel,
					// tracks which viewModel property is currently updating
					viewModelPropertyUpdates = {},
					// the object added to the viewModel
					componentScope,
					frag,
					// an array of teardown stuff that should happen when the element is removed
					teardownFunctions = [],
					callTeardownFunctions = function(){
						for(var i = 0, len = teardownFunctions.length ; i < len; i++) {
							teardownFunctions[i]();
						}
					};

				// ## Scope

				// Add viewModel prototype properties marked with an "@" to the `initialScopeData` object
				can.each(this.constructor.attributeScopeMappings, function (val, prop) {
					initialScopeData[prop] = el.getAttribute(can.hyphenate(val));
				});
				
				// Get the value in the viewModel for each attribute
				// the hookup should probably happen after?
				can.each(can.makeArray(el.attributes), function (node, index) {
					var name = can.camelize(node.nodeName.toLowerCase()),
						value = node.value;

					//!steal-remove-start
					// user tried to pass something like id="{foo}", so give them a good warning
					if(ignoreAttributesRegExp.test(name) && value[0] === "{" && value[value.length-1] === "}") {
						can.dev.warn("can/component: looks like you're trying to pass "+name+" as an attribute into a component, "+
							"but it is not a supported attribute");
					}
					//!steal-remove-end

					// Ignore attributes already present in the ScopeMappings.
					if (component.constructor.attributeScopeMappings[name] || ignoreAttributesRegExp.test(name) || viewCallbacks.attr(node.nodeName)) {
						return;
					}
					// Only setup bindings if attribute looks like `foo="{bar}"`
					if(value[0] === "{" && value[value.length-1] === "}") {
						value = value.substr(1, value.length - 2 );
					} else {
						// Legacy template types will crossbind "foo=bar"
						if(hookupOptions.templateType !== "legacy") {
							initialScopeData[name] = value;
							return;
						}
					}
					// Cross-bind the value in the scope to this
					// component's viewModel
					var computeData = hookupOptions.scope.computeData(value, {
						args: []
					}),
						compute = computeData.compute;

					// bind on this, check it's value, if it has dependencies
					var handler = function (ev, newVal) {
						// setup counter to prevent updating the scope with viewModel changes caused by scope updates.
						viewModelPropertyUpdates[name] = (viewModelPropertyUpdates[name] || 0 )+1;
						
						componentScope.attr(name, newVal);
						can.batch.afterPreviousEvents(function(){
							--viewModelPropertyUpdates[name];
						});
					};

					// Compute only returned if bindable
					compute.bind("change", handler);

					// Set the value to be added to the viewModel
					initialScopeData[name] = compute();
					
					// We don't need to listen to the compute `change` if it doesn't have any dependencies
					if (!compute.computeInstance.hasDependencies) {
						compute.unbind("change", handler);
					} else {
						// Make sure we unbind (there's faster ways of doing this)
						teardownFunctions.push(function () {
							compute.unbind("change", handler);
						});
						// Setup the two-way binding
						twoWayBindings[name] = computeData;
					}

				});
				if (this.constructor.Map) {
					// If `Map` property is set on the constructor use it to wrap the `initialScopeData`
					componentScope = new this.constructor.Map(initialScopeData);
				} else if (scope instanceof can.Map) {
					// If `this.scope` is instance of `can.Map` assign it to the `componentScope`
					componentScope = scope;
				} else if (can.isFunction(scope)) {
					// If `this.viewModel` is a function, call the function and
					var scopeResult = scope.call(this, initialScopeData, hookupOptions.scope, el);

					if (scopeResult instanceof can.Map) {
						// If the function returns a can.Map, use that as the viewModel
						componentScope = scopeResult;
					} else if (scopeResult.prototype instanceof can.Map) {
						// If `scopeResult` is of a `can.Map` type, use it to wrap the `initialScopeData`
						componentScope = new scopeResult(initialScopeData);
					} else {
						// Otherwise extend `can.Map` with the `scopeResult` and initialize it with the `initialScopeData`
						componentScope = new(can.Map.extend(scopeResult))(initialScopeData);
					}

				}

				// ## Two way bindings

				// Object to hold the bind handlers so we can tear them down
				var handlers = {};
				// Setup reverse bindings
				can.each(twoWayBindings, function (computeData, prop) {
					handlers[prop] = function (ev, newVal) {
						// Check that this property is not being changed because
						// it's scope value just changed
						if (!viewModelPropertyUpdates[prop]) {
							//console.log("updating view.scope ",prop,"from",  componentScope._cid);
							computeData.compute(newVal);
						}
					};
					componentScope.bind(prop, handlers[prop]);
				});
				// Setup the attributes bindings
				if (!can.isEmptyObject(this.constructor.attributeScopeMappings) || hookupOptions.templateType !== "legacy") {
					// Bind on the `attributes` event and update the viewModel.
					can.bind.call(el, "attributes", function (ev) {
						// Convert attribute name from the `attribute-name` to the `attributeName` format.
						var camelized = can.camelize(ev.attributeName);
						if (!twoWayBindings[camelized] && !ignoreAttributesRegExp.test(camelized) ) {
							// If there is a mapping for this attribute, update the `componentScope` attribute
							componentScope.attr(camelized, el.getAttribute(ev.attributeName));
						}
					});

				}

				// Set `componentScope` to `this.viewModel` and set it to the element's `data` object as a `viewModel` property
				this.scope = this.viewModel = componentScope;
				can.data(can.$(el), "scope", this.scope);
				can.data(can.$(el), "viewModel", this.scope);

				// Create a real Scope object out of the viewModel property
				var renderedScope = lexicalContent ?
						this.scope :
						hookupOptions.scope.add(this.scope),
					options = {
						helpers: {}
					};

				// ## Helpers

				// Setup helpers to callback with `this` as the component
				can.each(this.helpers || {}, function (val, prop) {
					if (can.isFunction(val)) {
						options.helpers[prop] = function () {
							return val.apply(componentScope, arguments);
						};
					}
				});
				
				
				// Teardown reverse bindings when the element is removed
				teardownFunctions.push(function(){
					can.each(handlers, function (handler, prop) {
						componentScope.unbind(prop, handlers[prop]);
					});
				});

				// ## `events` control

				// Create a control to listen to events
				this._control = new this.constructor.Control(el, {
					// Pass the viewModel to the control so we can listen to it's changes from the controller.
					scope: this.scope,
					viewModel: this.scope
				});

				// If control has a 'destroy' event, unbind the properties after its called #1415
				if(this._control && this._control.destroy){
					var oldDestroy = this._control.destroy;
					this._control.destroy = function(){
						oldDestroy.apply(this, arguments);
						callTeardownFunctions();
					};
					this._control.on();
				} else {
					can.bind.call(el, "removed", function () {
						callTeardownFunctions();
					});
				}

				// ## Rendering

				// Keep a nodeList so we can kill any directly nested nodeLists within this component
				var nodeList = can.view.nodeLists.register([], undefined, true);
				teardownFunctions.push(function(){
					can.view.nodeLists.unregister(nodeList);
				});

				// If this component has a template (that we've already converted to a renderer)
				if (this.constructor.renderer) {
					// If `options.tags` doesn't exist set it to an empty object.
					if (!options.tags) {
						options.tags = {};
					}

					// We need be alerted to when a <content> element is rendered so we can put the original contents of the widget in its place
					options.tags.content = function contentHookup(el, rendererOptions) {
						// First check if there was content within the custom tag
						// otherwise, render what was within <content>, the default code
						var subtemplate = hookupOptions.subtemplate || rendererOptions.subtemplate;

						if (subtemplate) {

							// `rendererOptions.options` is a viewModel of helpers where `<content>` was found, so
							// the right helpers should already be available.
							// However, `_tags.content` is going to point to this current content callback.  We need to 
							// remove that so it will walk up the chain

							delete options.tags.content;

							// By default, light dom scoping is
							// dynamic. This means that any `{{foo}}`
							// bindings inside the "light dom" content of
							// the component will have access to the
							// internal viewModel. This can be overridden to be
							// lexical with the lexicalContent
							// option,
							var opts = !lexicalContent ||
									subtemplate !== hookupOptions.subtemplate ?
									rendererOptions :
									hookupOptions;
							
							if(rendererOptions.parentNodeList) {
								var frag = subtemplate( opts.scope, opts.options, rendererOptions.parentNodeList );
								elements.replace([el], frag);
							} else {
								can.view.live.replace([el], subtemplate( opts.scope, opts.options ));
							}

							// Restore the content tag so it could potentially be used again (as in lists)
							options.tags.content = contentHookup;
						}
					};
					// Render the component's template
					frag = this.constructor.renderer(renderedScope, hookupOptions.options.add(options), nodeList);
				} else {
					// Otherwise render the contents between the 
					if(hookupOptions.templateType === "legacy") {
						frag = can.view.frag(hookupOptions.subtemplate ? hookupOptions.subtemplate(renderedScope, hookupOptions.options.add(options)) : "");
					} else {
						// we need to be the parent ... or we need to 
						frag = hookupOptions.subtemplate ?
							hookupOptions.subtemplate(renderedScope, hookupOptions.options.add(options), nodeList) :
							document.createDocumentFragment();
					}
					
				}
				// Append the resulting document fragment to the element
				can.appendChild(el, frag);
				
				// update the nodeList with the new children so the mapping gets applied
				can.view.nodeLists.update(nodeList, el.childNodes);
			}
		});

	var ComponentControl = can.Control.extend({
		// Change lookup to first look in the viewModel.
		_lookup: function (options) {
			return [options.scope, options, window];
		},
		_action: function (methodName, options, controlInstance ) {
			var hasObjectLookup, readyCompute;

			paramReplacer.lastIndex = 0;

			hasObjectLookup = paramReplacer.test(methodName);

			// If we don't have options (a `control` instance), we'll run this 
			// later.
			if( !controlInstance && hasObjectLookup) {
				return;
			} else if( !hasObjectLookup ) {
				return can.Control._action.apply(this, arguments);
			} else {
				// We have `hasObjectLookup` and `controlInstance`.

				readyCompute = can.compute(function(){
					var delegate;
					
					// Set the delegate target and get the name of the event we're listening to.
					var name = methodName.replace(paramReplacer, function(matched, key){
						var value;

						// If we are listening directly on the `viewModel` set it as a delegate target.
						if(key === "scope" || key === "viewModel") {
							delegate = options.scope;
							return "";
						}
						
						// Remove `scope.` from the start of the key and read the value from the `viewModel`.
						key = key.replace(/^(scope|^viewModel)\./,"");
						value = can.compute.read(options.scope, key.split("."), {isArgument: true}).value;

						// If `value` is undefined use `can.getObject` to get the value.
						if(value === undefined) {
							value = can.getObject(key);
						}

						// If `value` is a string we just return it, otherwise we set it as a delegate target.
						if(typeof value === "string") {
							return value;
						} else {
							delegate = value;
							return "";
						}
	
					});
					
					// Get the name of the `event` we're listening to.
					var parts = name.split(/\s+/g),
						event = parts.pop();

					// Return everything needed to handle the event we're listening to.
					return {
						processor: this.processors[event] || this.processors.click,
						parts: [name, parts.join(" "), event],
						delegate: delegate || undefined
					};
					
				}, this);

				// Create a handler function that we'll use to handle the `change` event on the `readyCompute`.
				var handler = function(ev, ready){
					controlInstance._bindings.control[methodName](controlInstance.element);
					controlInstance._bindings.control[methodName] = ready.processor(
									ready.delegate || controlInstance.element,
									ready.parts[2], ready.parts[1], methodName, controlInstance);
				};

				readyCompute.bind("change", handler);
				
				controlInstance._bindings.readyComputes[methodName] = {
					compute: readyCompute,
					handler: handler
				};

				return readyCompute();
			}
		}
	},
	// Extend `events` with a setup method that listens to changes in `viewModel` and
	// rebinds all templated event handlers.
	{
		setup: function (el, options) {
			this.scope = options.scope;
			this.viewModel = options.viewModel;
			return can.Control.prototype.setup.call(this, el, options);
		},
		off: function(){
			// If `this._bindings` exists we need to go through it's `readyComputes` and manually
			// unbind `change` event listeners set by the controller.
			if( this._bindings ) {
				can.each(this._bindings.readyComputes || {}, function (value) {
					value.compute.unbind("change", value.handler);
				});
			}
			// Call `can.Control.prototype.off` function on this instance to cleanup the bindings.
			can.Control.prototype.off.apply(this, arguments);
			this._bindings.readyComputes = {};
		}
	});

	/**
	 * @description Read and write a component element's viewModel.
	 *
	 * @function can.viewModel
	 * @parent can.util
	 * @signature `can.viewModel(el[, attr[, value]])`
	 * @param {HTMLElement|NodeList} el can.Component element to get viewModel of.
	 * @param {String} [attr] Attribute name to access.
	 * @param {*} [val] Value to write to the viewModel attribute.
	 *
	 * @return {*} If only one argument, returns the viewModel itself. If two
	 * arguments are given, returns the attribute value. If three arguments
	 * are given, returns the element itself after assigning the value (for
	 * chaining).
	 *
	 * @body
	 *
	 * `can.viewModel` can be used to directly access a [can.Component]'s
	 * viewModel. Depending on how it's called, it can be used to get the
	 * entire viewModel object, read a specific property from it, or write a
	 * property. The property read and write features can be seen as a
	 * shorthand for code such as `$("my-thing").viewModel().attr("foo", val);`
	 *
	 * If using jQuery, this function is accessible as a jQuery plugin,
	 * with one fewer argument to the call. For example,
	 * `$("my-element").viewModel("name", "Whatnot");`
	 *
	 */
		// Define the `can.viewModel` function that can be used to retrieve the
		// `viewModel` from the element
	

	var $ = can.$;

	// If `$` has an `fn` object create the
	// `scope` plugin that returns the scope object.
	if ($.fn) {
		$.fn.scope = $.fn.viewModel = function () {
			// Just use `can.scope` as the base for this function instead
			// of repeating ourselves.
			return can.viewModel.apply(can, [this].concat(can.makeArray(arguments)));
		};
	}
	
	return Component;
});

