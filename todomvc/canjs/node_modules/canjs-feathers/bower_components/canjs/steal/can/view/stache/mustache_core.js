/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/stache/mustache_core*/
// # can/view/stache/mustache_core.js
// 
// This provides helper utilities for Mustache processing. Currently,
// only stache uses these helpers.  Ideally, these utilities could be used
// in other libraries implementing Mustache-like features.  

steal("can/util",
	"./utils",
	"./mustache_helpers",
	"can/view/live",
	"can/view/elements.js",
	"can/view/scope",
	"can/view/node_lists",
	function(can, utils, mustacheHelpers, live, elements, Scope, nodeLists ){

	live = live || can.view.live;
	elements = elements || can.view.elements;
	Scope = Scope || can.view.Scope;
	nodeLists = nodeLists || can.view.nodeLists;
	
	// ## Types
	
	// A lookup is an object that is used to identify a lookup in the scope.
	/**
	 * @hide
	 * @typedef {{get: String}} can.mustache.Lookup
	 * @option {String} get A value in the scope to look up.
	 */
	

	// ## Helpers
	
	// Breaks up the name and arguments of a mustache expression.
	var argumentsRegExp = /((([^'"\s]+?=)?('.*?'|".*?"))|.*?)\s/g,
		// Identifies the type of an argument or hash in a mustache expression.
		literalNumberStringBooleanRegExp = /^(?:(?:('.*?'|".*?")|([0-9]+\.?[0-9]*|true|false|null|undefined))|(?:(.+?)=(?:(?:('.*?'|".*?")|([0-9]+\.?[0-9]*|true|false|null|undefined))|(.+))))$/,
		// Finds mustache tags and their surrounding whitespace.
		mustacheLineBreakRegExp = /(?:(?:^|(\r?)\n)(\s*)(\{\{([^\}]*)\}\}\}?)([^\S\n\r]*)($|\r?\n))|(\{\{([^\}]*)\}\}\}?)/g,
		// Identifies if an argument value should be looked up.
		isLookup = function (obj) {
			return obj && typeof obj.get === "string";
		},
		// A helper for calling the truthy subsection for each item in a list and putting them in a document Fragment.
		getItemsFragContent = function(items, isObserveList, helperOptions, options){
			var frag = document.createDocumentFragment();
			for (var i = 0, len = items.length; i < len; i++) {
				append(frag, helperOptions.fn( isObserveList ? items.attr('' + i) : items[i], options) );
			}
			return frag;
		},
		// Appends some content to a document fragment.  If the content is a string, it puts it in a TextNode.
		append = function(frag, content){
			if(content) {
				frag.appendChild(typeof content === "string" ? document.createTextNode(content) : content);
			}
		},
		// A helper for calling the truthy subsection for each item in a list and returning them in a string.
		getItemsStringContent = function(items, isObserveList, helperOptions, options){
			var txt = "";
			for (var i = 0, len = items.length; i < len; i++) {
				txt += helperOptions.fn( isObserveList ? items.attr('' + i) : items[i], options);
			}
			return txt;
		},
		getKeyComputeData = function (key, scope, isArgument) {

			// Get a compute (and some helper data) that represents key's value in the current scope
			var data = scope.computeData(key, {
				isArgument: isArgument,
				args: [scope.attr('.'), scope]
			});
			
			can.compute.temporarilyBind(data.compute);
			
			return data;
		},
		// Returns a value or compute for the given key.
		getKeyArgValue = function(key, scope){
			var data = getKeyComputeData(key, scope, true);
			// If there are no dependencies, just return the value.
			if (!data.compute.computeInstance.hasDependencies) {
				return data.initialValue;
			} else {
				return data.compute;
			}
		},
		// Sets .fn and .inverse on a helperOptions object and makes sure 
		// they can reference the current scope and options.
		convertToScopes = function(helperOptions, scope, options, nodeList, truthyRenderer, falseyRenderer){
			// overwrite fn and inverse to always convert to scopes
			if(truthyRenderer) {
				helperOptions.fn = makeRendererConvertScopes(truthyRenderer, scope, options, nodeList);
			}
			if(falseyRenderer) {
				helperOptions.inverse = makeRendererConvertScopes(falseyRenderer, scope, options, nodeList);
			}
		},
		// Returns a new renderer function that makes sure any data or helpers passed
		// to it are converted to a can.view.Scope and a can.view.Options.
		makeRendererConvertScopes = function (renderer, parentScope, parentOptions, nodeList) {
			var rendererWithScope = function(ctx, opts, parentNodeList){
				return renderer(ctx || parentScope, opts, parentNodeList);
			};
			return can.__notObserve(function (newScope, newOptions, parentNodeList) {
				// prevent binding on fn.
				// If a non-scope value is passed, add that to the parent scope.
				if (newScope !== undefined && !(newScope instanceof can.view.Scope)) {
					newScope = parentScope.add(newScope);
				}
				if (newOptions !== undefined && !(newOptions instanceof core.Options)) {
					newOptions = parentOptions.add(newOptions);
				}
				var result = rendererWithScope(newScope, newOptions || parentOptions, parentNodeList|| nodeList );
				return result;
			});
		};
	

	
	var core = {
		// ## mustacheCore.expressionData
		// Returns processed information about the arguments and hash in a mustache expression.
		/**
		 * @hide
		 * Returns processed information about the arguments and hash in a mustache expression.
		 * @param {can.mustache.Expression} An expression minus the mode like: `each items animate="in"`
		 * @return {Object} Packaged info about the expression for faster processing.
		 * @option {can.mustache.Lookup|*} name The first key which is usually the name of a value or a helper to lookup.
		 * @option {Array<can.mustache.Lookup|*>} args An array of lookup values or JS literal values.
		 * @option {Object.<String,can.mustache.Lookup|*>} hashes A mapping of hash name to lookup values or JS literal values.
		 */
		expressionData: function(expression){
			var args = [],
				hashes = {},
				i = 0;
			
			(can.trim(expression) + ' ').replace(argumentsRegExp, function (whole, arg) {
				var m;
				// Check for special helper arguments (string/number/boolean/hashes).
				if (i && (m = arg.match(literalNumberStringBooleanRegExp))) {
					if(m[1] || m[2]) {
						args.push(utils.jsonParse(m[1] || m[2]));
					}
					// Found a hash object.
					else {
						// Addd to the hash object.
						hashes[m[3]] =  (m[6] ?  {get: m[6]} :  utils.jsonParse(m[4] || m[5]));
					}
				}
				// Otherwise output a normal interpolation reference.
				else {
					args.push({get: arg});
				}
				i++;
			});
			
			return {
				name: args.shift(),
				args: args,
				hash: hashes
			};
		},
		// ## mustacheCore.makeEvaluator
		// Given a scope and expression, returns a function that evaluates that expression in the scope. 
		// 
		// This function first reads lookup values in the args and hash.  Then it tries to figure out
		// if a helper is being called or a value is being read.  Finally, depending on
		// if it's a helper, or not, and which mode the expression is in, it returns
		// a function that can quickly evaluate the expression.
		/**
		 * @hide 
		 * Given a mode and expresion data, returns a function that evaluates that expression. 
		 * @param {can.view.Scope} The scope in which the expression is evaluated.
		 * @param {can.view.Options} The option helpers in which the expression is evaluated.
		 * @param {String} mode Either null, #, ^. > is handled elsewhere
		 * @param {Object} exprData Data about what was in the mustache expression
		 * @param {renderer} [truthyRenderer] Used to render a subsection 
		 * @param {renderer} [falseyRenderer] Used to render the inverse subsection
		 * @param {String} [stringOnly] A flag to indicate that only strings will be returned by subsections.
		 * @return {Function} An 'evaluator' function that evaluates the expression.
		 */
		makeEvaluator: function (scope, options, nodeList, mode, exprData, truthyRenderer, falseyRenderer, stringOnly) {
			// Arguments for the helper.
			var args = [],
				// Hash values for helper.
				hash = {},
				// Helper options object.
				helperOptions = {
					fn: function () {},
					inverse: function () {}
				},
				// The current context.
				context = scope.attr("."),
				
				// The main value.
				name = exprData.name,
				
				// If name is a helper, this gets set to the helper.
				helper,
				// `true` if the expression looks like a helper.
				looksLikeAHelper = exprData.args.length || !can.isEmptyObject(exprData.hash),
				// The "peaked" at value of the name.
				initialValue,
				// The function that calls the helper
				helperEvaluator;
				
			// Convert lookup values in arguments to actual values.
			for(var i = 0, len = exprData.args.length; i < len; i++) {
				var arg = exprData.args[i];
				if (arg && isLookup(arg)) {
					args.push(getKeyArgValue(arg.get, scope, true));
				} else {
					args.push(arg);
				}
			}
			// Convert lookup values in hash to actual values.
			for(var prop in exprData.hash) {
				if (isLookup(exprData.hash[prop])) {
					hash[prop] = getKeyArgValue(exprData.hash[prop].get, scope);
				} else {
					hash[prop] = exprData.hash[prop];
				}
			}

			// Lookup value in name.  Also determine if name is a helper.
			if ( isLookup(name) ) {
			
				// If the expression looks like a helper, try to get a helper right away.
				if (looksLikeAHelper) {
					// Try to find a registered helper.
					helper = mustacheHelpers.getHelper(name.get, options);
					
					// If a function is on top of the context, call that as a helper.
					if(!helper && typeof context[name.get] === "function") {
						helper = {fn: context[name.get]};
					}

				}
				// If a helper has not been found, either because this does not look like a helper
				// or because a helper was not found, get the value of name and determine 
				// if it's a value or not.
				if(!helper) {
					var get = name.get;
					
					// Get info about the compute that represents this lookup.
					// This way, we can get the initial value without "reading" the compute.
					var computeData = getKeyComputeData(name.get, scope, false),
						compute = computeData.compute;
						
					initialValue = computeData.initialValue;

					// Set name to be the compute if the compute reads observables,
					// or the value of the value of the compute if no observables are found.
					if(computeData.compute.computeInstance.hasDependencies) {
						name = compute;
					} else {
						name = initialValue;
					}

					// If it doesn't look like a helper and there is no value, check helpers
					// anyway. This is for when foo is a helper in `{{foo}}`.
					if( !looksLikeAHelper && initialValue === undefined ) {
						helper = mustacheHelpers.getHelper(get, options);
					}
					// Otherwise, if the value is a function, we'll call that as a helper.
					else if(typeof initialValue === "function") {
						helper = {
							fn: initialValue
						};
					}

				}
				//!steal-remove-start
				if ( !helper && initialValue === undefined) {
					if(looksLikeAHelper) {
						can.dev.warn('can/view/stache/mustache_core.js: Unable to find helper "' + exprData.name.get + '".');
					} else {
						can.dev.warn('can/view/stache/mustache_core.js: Unable to find key or helper "' + exprData.name.get + '".');
					}
				}
				//!steal-remove-end
			}


			
			// If inverse mode, reverse renderers.
			if(mode === "^") {
				var temp = truthyRenderer;
				truthyRenderer = falseyRenderer;
				falseyRenderer = temp;
			}
			
			// Check for a registered helper or a helper-like function.
			if ( helper ) {
				
				// Add additional data to be used by helper functions
				convertToScopes(helperOptions, scope, options, nodeList, truthyRenderer, falseyRenderer);

				can.simpleExtend(helperOptions, {
					context: context,
					scope: scope,
					contexts: scope,
					hash: hash,
					nodeList: nodeList,
					exprData: exprData
				});

				args.push(helperOptions);
				// Call the helper.
				helperEvaluator = function () {
					return helper.fn.apply(context, args) || '';
				};
				helperEvaluator.bindOnce = false;
				return helperEvaluator;

			}
			
			// Return evaluators for no mode.
			if(!mode) {
				// If it's computed, return a function that just reads the compute.
				if(name && name.isComputed) {
					return name;
				}
				// Just return name as the value
				else {
					
					return function(){
						return '' + (name != null ? name : '');
					};
				}
			} else if( mode === "#" || mode === "^" ) {
				// Setup renderers.
				convertToScopes(helperOptions, scope, options, nodeList, truthyRenderer, falseyRenderer);
				var evaluator = function(){
					// Get the value
					var value;
					if (can.isFunction(name) && name.isComputed) {
						value = name();
					} else {
						value = name;
					}
					// If it's an array, render.
					if (utils.isArrayLike(value) ) {
						var isObserveList = utils.isObserveLike(value);
						
						if(isObserveList ? value.attr("length") : value.length) {
							return (stringOnly ? getItemsStringContent: getItemsFragContent  )
								(value, isObserveList, helperOptions, options);
						} else {
							return helperOptions.inverse(scope, options);
						}
					}
					// If truthy, render fn, otherwise, inverse.
					else {
						return value ? helperOptions.fn(value || scope, options) : helperOptions.inverse(scope, options);
					}
				};
				evaluator.bindOnce = false;
				return evaluator;
			} else {
				// not supported!
			}
		},
		// ## mustacheCore.makeLiveBindingPartialRenderer
		// Returns a renderer function that live binds a partial.
		/**
		 * @hide
		 * Returns a renderer function that live binds a partial.
		 * @param {String} partialName the name of the partial.
		 * @return {function(this:HTMLElement,can.view.Scope,can.view.Options)} A renderer function 
		 * live binds a partial.
		 */
		makeLiveBindingPartialRenderer: function(partialName, state){
			partialName = can.trim(partialName);

			return function(scope, options, parentSectionNodeList){

				var nodeList = [this];
				nodeList.expression = ">" + partialName;
				nodeLists.register(nodeList, null, state.directlyNested ? parentSectionNodeList || true :  true);

				var partialFrag = can.compute(function(){
					var localPartialName = partialName;
						// Look up partials in options first.
					var partial = options.attr("partials." + localPartialName),
						res;
					if (partial) {
						res = partial.render ? partial.render(scope, options) :
							partial(scope, options);
					}
					// Use can.view to get and render the partial.
					else {
						var scopePartialName = scope.read(localPartialName, {
							isArgument: true,
							returnObserveMethods: true,
							proxyMethods: false
						}).value;

						if (scopePartialName) {
							localPartialName = scopePartialName;
						}

						res = can.view.render(localPartialName, scope, options );
					}

					return can.frag(res);

				});

				live.html(this, partialFrag, this.parentNode, nodeList);

			};
		},
		// ## mustacheCore.makeStringBranchRenderer
		// Return a renderer function that evalutes to a string and caches
		// the evaluator on the scope.
		/**
		 * @hide
		 * Return a renderer function that evaluates to a string.
		 * @param {String} mode
		 * @param {can.mustache.Expression} expression
		 * @return {function(can.view.Scope,can.view.Options, can.view.renderer, can.view.renderer)} 
		 */
		makeStringBranchRenderer: function(mode, expression){
			var exprData = expressionData(expression),
				// Use the full mustache expression as the cache key.
				fullExpression = mode+expression;

			// A branching renderer takes truthy and falsey renderer.
			return function branchRenderer(scope, options, truthyRenderer, falseyRenderer){
				// Check the scope's cache if the evaluator already exists for performance.
				var evaluator = scope.__cache[fullExpression];
				if(mode || !evaluator) {
					evaluator = makeEvaluator( scope, options, null, mode, exprData, truthyRenderer, falseyRenderer, true);
					if(!mode) {
						scope.__cache[fullExpression] = evaluator;
					}
				}

				// Run the evaluator and return the result.
				var res = evaluator();
				return res == null ? "" : ""+res;
			};
		},
		// ## mustacheCore.makeLiveBindingBranchRenderer
		// Return a renderer function that evaluates the mustache expression and 
		// sets up live binding if a compute with dependencies is found. Otherwise,
		// the element's value is set.
		//
		// This function works by creating a `can.compute` from the mustache expression.
		// If the compute has dependent observables, it passes the compute to `can.view.live`; otherwise,
		// it updates the element's property based on the compute's value.
		/**
		 * @hide
		 * Returns a renderer function that evaluates the mustache expression.
		 * @param {String} mode
		 * @param {can.mustache.Expression} expression
		 * @param {Object} state The html state of where the expression was found.
		 */
		makeLiveBindingBranchRenderer: function(mode, expression, state){
			
			// Pre-process the expression.
			var exprData = expressionData(expression);
			
			// A branching renderer takes truthy and falsey renderer.
			return function branchRenderer(scope, options, parentSectionNodeList, truthyRenderer, falseyRenderer){
				
				var nodeList = [this];
				nodeList.expression = expression;
				// register this nodeList.
				// Regsiter it with its parent ONLY if this is directly nested.  Otherwise, it's unencessary.
				nodeLists.register(nodeList, null, state.directlyNested ? parentSectionNodeList || true :  true);
				
				
				// Get the evaluator. This does not need to be cached (probably) because if there
				// an observable value, it will be handled by `can.view.live`.
				var evaluator = makeEvaluator( scope, options, nodeList, mode, exprData, truthyRenderer, falseyRenderer,
					// If this is within a tag, make sure we only get string values. 
					state.tag );
				
				// Create a compute that can not be observed by other 
				// comptues. This is important because this renderer is likely called by 
				// parent expresions.  If this value changes, the parent expressions should
				// not re-evaluate. We prevent that by making sure this compute is ignored by 
				// everyone else.
				var compute = can.compute(evaluator, null, false, evaluator.bindOnce === false ?  false : true);
				
				// Bind on the compute to set the cached value. This helps performance
				// so live binding can read a cached value instead of re-calculating.
				compute.bind("change", can.k);
				var value = compute();
				
				// If value is a function, it's a helper that returned a function.
				if(typeof value === "function") {
					
					// A helper function should do it's own binding.  Similar to how
					// we prevented this function's compute from being noticed by parent expressions,
					// we hide any observables read in the function by saving any observables that
					// have been read and then setting them back which overwrites any `can.__observe` calls
					// performed in value.
					var old = can.__clearReading();
					value(this);
					can.__setReading(old);
					
				}
				// If the compute has observable dependencies, setup live binding.
				else if( compute.computeInstance.hasDependencies ) {
					
					// Depending on where the template is, setup live-binding differently.
					if(state.attr) {
						live.simpleAttribute(this, state.attr, compute);
					}
					else if( state.tag )  {
						live.attributes( this, compute );
					}
					else if(state.text && typeof value !== "object"){
						live.text(this, compute, this.parentNode, nodeList);
					}
					else {
						live.html(this, compute, this.parentNode, nodeList);
					}
				}
				// If the compute has no observable dependencies, just set the value on the element.
				else {
					
					if(state.attr) {
						can.attr.set(this, state.attr, value);
					}
					else if(state.tag) {
						live.setAttributes(this, value);
					}
					else if(state.text && typeof value === "string") {
						this.nodeValue = value;
					}
					else if( value ){
						elements.replace([this], can.frag(value));
					}
				}
				// Unbind the compute. 
				compute.unbind("change", can.k);
			};
		},
		// ## mustacheCore.splitModeFromExpression
		// Returns the mustache mode split from the rest of the expression.
		/**
		 * @hide
		 * Returns the mustache mode split from the rest of the expression.
		 * @param {can.mustache.Expression} expression
		 * @param {Object} state The state of HTML where the expression was found.
		 */
		splitModeFromExpression: function(expression, state){
			expression = can.trim(expression);
			var mode = expression.charAt(0);
	
			if( "#/{&^>!".indexOf(mode) >= 0 ) {
				expression = can.trim( expression.substr(1) );
			} else {
				mode = null;
			}
			// Triple braces do nothing within a tag.
			if(mode === "{" && state.node) {
				mode = null;
			}
			return {
				mode: mode,
				expression: expression
			};
		},
		// ## mustacheCore.cleanLineEndings
		// Removes line breaks accoding to the mustache specification.
		/**
		 * @hide
		 * Prunes line breaks accoding to the mustache specification.
		 * @param {String} template
		 * @return {String}
		 */
		cleanLineEndings: function(template){
			
			// Finds mustache tags with space around them or no space around them.
			return template.replace( mustacheLineBreakRegExp,
				function(whole,
					returnBefore,
					spaceBefore,
					special,
					expression,
					spaceAfter,
					returnAfter,
					// A mustache magic tag that has no space around it.
					spaceLessSpecial,
					spaceLessExpression,
					matchIndex){
				
				// IE 8 will provide undefined
				spaceAfter = (spaceAfter || "");
				returnBefore = (returnBefore || "");
				spaceBefore = (spaceBefore || "");
				
				var modeAndExpression = splitModeFromExpression(expression || spaceLessExpression,{});
				
				// If it's a partial or tripple stache, leave in place.
				if(spaceLessSpecial || ">{".indexOf( modeAndExpression.mode) >= 0) {
					return whole;
				}  else if( "^#!/".indexOf(  modeAndExpression.mode ) >= 0 ) {
					
					// Return the magic tag and a trailing linebreak if this did not 
					// start a new line and there was an end line.
					return special+( matchIndex !== 0 && returnAfter.length ? returnBefore+"\n" :"");

							
				} else {
					// There is no mode, return special with spaces around it.
					return spaceBefore+special+spaceAfter+(spaceBefore.length || matchIndex !== 0 ? returnBefore+"\n" : "");
				}
				
			});
		},
		// ## can.view.Options
		// 
		// This contains the local helpers, partials, and tags available to a template.
		/**
		 * @hide
		 * The Options scope.
		 */
		Options: can.view.Scope.extend({
			init: function (data, parent) {
				if (!data.helpers && !data.partials && !data.tags) {
					data = {
						helpers: data
					};
				}
				can.view.Scope.prototype.init.apply(this, arguments);
			}
		})
	};
	
	// ## Local Variable Cache
	//
	// The following creates slightly more quickly accessible references of the following
	// core functions.
	var makeEvaluator = core.makeEvaluator,
		expressionData = core.expressionData,
		splitModeFromExpression = core.splitModeFromExpression;
	
	
	return core;
});




