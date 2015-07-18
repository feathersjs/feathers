/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/mustache/mustache*/
steal('can/util',
	'can/view/scope',
	'can/view',
	'can/view/scanner.js',
	'can/compute',
	'can/view/render.js',
	'can/view/bindings',
	function (can) {

		// # mustache.js
		// `can.Mustache`: The Mustache templating engine.
		// 
		// See the [Transformation](#section-29) section within *Scanning Helpers* for a detailed explanation 
		// of the runtime render code design. The majority of the Mustache engine implementation 
		// occurs within the *Transformation* scanning helper.

		// ## Initialization
		//
		// Define the view extension.
		can.view.ext = ".mustache";

		// ### Setup internal helper variables and functions.
		//
		// An alias for the context variable used for tracking a stack of contexts.
		// This is also used for passing to helper functions to maintain proper context.
		var SCOPE = 'scope',
			// An alias for the variable used for the hash object that can be passed
			// to helpers via `options.hash`.
			HASH = '___h4sh',
			// An alias for the most used context stacking call.
			CONTEXT_OBJ = '{scope:' + SCOPE + ',options:options}',
			// a context object used to incidate being special
			SPECIAL_CONTEXT_OBJ = '{scope:' + SCOPE + ',options:options, special: true}',
			// argument names used to start the function (used by scanner and steal)
			ARG_NAMES = SCOPE + ",options",

			// matches arguments inside a {{ }}
			argumentsRegExp = /((([^'"\s]+?=)?('.*?'|".*?"))|.*?)\s/g,

			// matches a literal number, string, null or regexp
			literalNumberStringBooleanRegExp = /^(('.*?'|".*?"|[0-9]+\.?[0-9]*|true|false|null|undefined)|((.+?)=(('.*?'|".*?"|[0-9]+\.?[0-9]*|true|false)|(.+))))$/,

			// returns an object literal that we can use to look up a value in the current scope
			makeLookupLiteral = function (type) {
				return '{get:"' + type.replace(/"/g, '\\"') + '"}';
			},
			// returns if the object is a lookup
			isLookup = function (obj) {
				return obj && typeof obj.get === "string";
			},

			/*
			 * Checks whether an object is like a can.Map. This takes into
			 * fact that can.route is can.Map like.
			 * @param  {[can.Map]}  observable
			 * @return {Boolean} returns if the object is observable like.
			 */
			isObserveLike = function (obj) {
				return obj instanceof can.Map || (obj && !! obj._get);
			},

			/*
			 * Tries to determine if the object passed is an array.
			 * @param  {Array}  obj The object to check.
			 * @return {Boolean} returns if the object is an array.
			 */
			isArrayLike = function (obj) {
				return obj && obj.splice && typeof obj.length === 'number';
			},
			// used to make sure .fn and .inverse are always called with a Scope like object
			makeConvertToScopes = function (original, scope, options) {
				var originalWithScope = function(ctx, opts){
					return original(ctx || scope, opts);
				};
				return function (updatedScope, updatedOptions) {
					if (updatedScope !== undefined && !(updatedScope instanceof can.view.Scope)) {
						updatedScope = scope.add(updatedScope);
					}
					if (updatedOptions !== undefined && !(updatedOptions instanceof can.view.Options)) {
						updatedOptions = options.add(updatedOptions);
					}
					return originalWithScope(updatedScope, updatedOptions || options);
				};
			};

		// ## Mustache
		/**
		 * @hide
		 * The Mustache templating engine.
		 * @param {Object} options	Configuration options
		 */
		var Mustache = function (options, helpers) {
			// Support calling Mustache without the constructor.
			// This returns a function that renders the template.
			if (this.constructor !== Mustache) {
				var mustache = new Mustache(options);
				return function (data, options) {
					return mustache.render(data, options);
				};
			}

			// If we get a `function` directly, it probably is coming from
			// a `steal`-packaged view.
			if (typeof options === "function") {
				this.template = {
					fn: options
				};
				return;
			}

			// Set options on self.
			can.extend(this, options);
			this.template = this.scanner.scan(this.text, this.name);
		};

		/**
		 * @add can.MustacheConstructor
		 */
		// Put Mustache on the `can` object.
		can.Mustache = can.global.Mustache = Mustache;

		/** 
		 * @prototype
		 */
		Mustache.prototype.
		/**
		 * @function can.MustacheConstructor.prototype.render render
		 * @parent can.MustacheConstructor.prototype
		 * @signature `mustache.render( data [, helpers] )`
		 * @param {Object} data Data to interpolate into the template.
		 * @return {String} The template with interpolated data, in string form.
		 * @hide
		 *
		 * @body
		 * Renders an object with view helpers attached to the view.
		 *
		 *		 new Mustache({text: "<%= message %>"}).render({
		 *			 message: "foo"
		 *		 })
		 */
		render = function (data, options) {
			if (!(data instanceof can.view.Scope)) {
				data = new can.view.Scope(data || {});
			}
			if (!(options instanceof can.view.Options)) {
				options = new can.view.Options(options || {});
			}
			options = options || {};

			return this.template.fn.call(data, data, options);
		};

		can.extend(Mustache.prototype, {
			// Share a singleton scanner for parsing templates.
			scanner: new can.view.Scanner({
				// A hash of strings for the scanner to inject at certain points.
				text: {
					// This is the logic to inject at the beginning of a rendered template. 
					// This includes initializing the `context` stack.
					start: "", //"var "+SCOPE+"= this instanceof can.view.Scope? this : new can.view.Scope(this);\n",
					scope: SCOPE,
					options: ",options: options",
					argNames: ARG_NAMES
				},

				// An ordered token registry for the scanner.
				// This needs to be ordered by priority to prevent token parsing errors.
				// Each token follows the following structure:
				//
				//		[
				//			// Which key in the token map to match.
				//			"tokenMapName",
				//
				//			// A simple token to match, like "{{".
				//			"token",
				//
				//			// Optional. A complex (regexp) token to match that 
				//			// overrides the simple token.
				//			"[\\s\\t]*{{",
				//
				//			// Optional. A function that executes advanced 
				//			// manipulation of the matched content. This is 
				//			// rarely used.
				//			function(content){   
				//				return content;
				//			}
				//		]
				tokens: [
					/**
					 * @function can.mustache.tags.escaped {{key}}
					 *
					 * @description Insert the value of the [can.mustache.key key] into the
					 * output of the template.
					 *
					 * @parent can.mustache.tags 0
					 *
					 * @signature `{{key}}`
					 *
					 * @param {can.mustache.key} key A key that references one of the following:
					 *
					 *  - A [can.mustache.registerHelper registered helper].
					 *  - A value within the current or parent
					 *    [can.mustache.context context]. If the value is a function or [can.compute], the
					 *    function's return value is used.
					 *
					 * @return {String|Function|*}
					 *
					 * After the key's value is found (and set to any function's return value),
					 * it is passed to [can.view.txt] as the result of a call to its `func`
					 * argument. There, if the value is a:
					 *
					 *  - `null` or `undefined` - an empty string is inserted into the rendered template result.
					 *  - `String` or `Number` - the value is inserted into the rendered template result.
					 *  - `Function` - A [can.view.hook hookup] attribute or element is inserted so this function
					 *    will be called back with the DOM element after it is created.
					 *
					 * @body
					 *
					 * ## Use
					 *
					 * `{{key}}` insert data into the template. It most commonly references
					 * values within the current [can.mustache.context context]. For example:
					 *
					 * Rendering:
					 *
					 *     <h1>{{name}}</h1>
					 *
					 * With:
					 *
					 *     {name: "Austin"}
					 *
					 * Results in:
					 *
					 *     <h1>Austin</h1>
					 *
					 * If the key value is a String or Number, it is inserted into the template.
					 * If it is `null` or `undefined`, nothing is added to the template.
					 *
					 *
					 * ## Nested Properties
					 *
					 * Mustache supports nested paths, making it possible to
					 * look up properties nested deep inside the current context. For example:
					 *
					 * Rendering:
					 *
					 *     <h1>{{book.author}}</h1>
					 *
					 * With:
					 *
					 *     {
					 *       book: {
					 *         author: "Ernest Hemingway"
					 *       }
					 *     }
					 *
					 * Results in:
					 *
					 *     <h1>Ernest Hemingway</h1>
					 *
					 * ## Looking up values in parent contexts
					 *
					 * Sections and block helpers can create their own contexts. If a key's value
					 * is not found in the current context, it will look up the key's value
					 * in parent contexts. For example:
					 *
					 * Rendering:
					 *
					 *     {{#chapters}}
					 *        <li>{{title}} - {{name}}</li>
					 *     {{chapters}}
					 *
					 * With:
					 *
					 *     {
					 *       title: "The Book of Bitovi"
					 *       chapters: [{name: "Breakdown"}]
					 *     }
					 *
					 * Results in:
					 *
					 *     <li>The Book of Bitovi - Breakdown</li>
					 *
					 *
					 */
					// Return unescaped
					["returnLeft", "{{{", "{{[{&]"],
					// Full line comments
					["commentFull", "{{!}}", "^[\\s\\t]*{{!.+?}}\\n"],
					/**
					 * @function can.mustache.tags.comment {{!key}}
					 *
					 * @parent can.mustache.tags 7
					 *
					 * @description A comment that doesn't get inserted into the rendered result.
					 *
					 * @signature `{{!key}}`
					 *
					 * The comment tag operates similarly to a `<!-- -->` tag in HTML. It exists in your template but never shows up.
					 *
					 * @param {can.mustache.key} key Everything within this tag is completely ignored.
					 * @return {String}
					 *
					 */
					// Inline comments
					["commentLeft", "{{!", "(\\n[\\s\\t]*{{!|{{!)"],
					/**
					 * @function can.mustache.tags.unescaped {{{key}}}
					 *
					 * @parent can.mustache.tags 1
					 *
					 * @description Insert the unescaped value of the [can.mustache.key key] into the
					 * output of the template.
					 *
					 * @signature `{{{key}}}`
					 *
					 * Behaves just like [can.mustache.tags.escaped {{key}}] and [can.mustache.helpers.helper {{helper}}] but does not
					 * escape the result.
					 *
					 * @param {can.mustache.key} key A key that references a value within the current or parent
					 * context. If the value is a function or can.compute, the function's return value is used.
					 * @return {String|Function|*}
					 *
					 *
					 */
					//
					/**
					 * @function can.mustache.tags.unescaped2 {{&key}}
					 *
					 * @parent can.mustache.tags 2
					 *
					 * @description Insert the unescaped value of the [can.mustache.key key] into the
					 * output of the template.
					 *
					 * @signature `{{&key}}`
					 *
					 * The `{{&key}}` tag is an alias for [can.mustache.tags.unescaped {{{key}}}], behaving just
					 * like [can.mustache.tags.escaped {{key}}] and [can.mustache.helpers.helper {{helper}}] but does not
					 * escape the result.
					 *
					 * @param {can.mustache.key} key A key that references a value within the current or parent
					 * context. If the value is a function or can.compute, the function's return value is used.
					 * @return {String|Function|*}
					 *
					 */
					// Full line escapes
					// This is used for detecting lines with only whitespace and an escaped tag
					["escapeFull", "{{}}", "(^[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}$)",
						function (content) {
							return {
								before: /^\n.+?\n$/.test(content) ? '\n' : '',
								content: content.match(/\{\{(.+?)\}\}/)[1] || ''
							};
						}
					],
					// Return escaped
					["escapeLeft", "{{"],
					// Close return unescaped
					["returnRight", "}}}"],
					// Close tag
					["right", "}}"]
				],

				// ## Scanning Helpers
				//
				// This is an array of helpers that transform content that is within escaped tags like `{{token}}`. These helpers are solely for the scanning phase; they are unrelated to Mustache/Handlebars helpers which execute at render time. Each helper has a definition like the following:
				//
				//		{
				//			// The content pattern to match in order to execute.
				//			// Only the first matching helper is executed.
				//			name: /pattern to match/,
				//
				//			// The function to transform the content with.
				//			// @param {String} content   The content to transform.
				//			// @param {Object} cmd       Scanner helper data.
				//			//                           {
				//			//                             insert: "insert command",
				//			//                             tagName: "div",
				//			//                             status: 0
				//			//                           }
				//			fn: function(content, cmd) {
				//				return 'for text injection' || 
				//					{ raw: 'to bypass text injection' };
				//			}
				//		}
				helpers: [
					// ### Partials
					//
					// Partials begin with a greater than sign, like {{> box}}.
					// 
					// Partials are rendered at runtime (as opposed to compile time), 
					// so recursive partials are possible. Just avoid infinite loops.
					// 
					// For example, this template and partial:
					// 
					// 		base.mustache:
					// 			<h2>Names</h2>
					// 			{{#names}}
					// 				{{> user}}
					// 			{{/names}}
					// 			
					// 		user.mustache:
					// 			<strong>{{name}}</strong>
					{
						name: /^>[\s]*\w*/,
						fn: function (content, cmd) {
							// Get the template name and call back into the render method,
							// passing the name and the current context.
							var templateName = can.trim(content.replace(/^>\s?/, ''))
								.replace(/["|']/g, "");
							return "can.Mustache.renderPartial('" + templateName + "'," + ARG_NAMES + ")";
						}
					},

					// ### Data Hookup
					// 
					// This will attach the data property of `this` to the element
					// its found on using the first argument as the data attribute
					// key.
					// 
					// For example:
					// 	
					//		<li id="nameli" {{ data 'name' }}></li>
					// 
					// then later you can access it like:
					// 
					//		can.$('#nameli').data('name');
					/**
					 * @function can.mustache.helpers.data {{data name}}
					 * @parent can.mustache.htags 7
					 * @signature `{{data name}}`
					 *
					 * Adds the current [can.mustache.context context] to the
					 * element's [can.data].
					 *
					 * @param {String} name The name of the data attribute to use for the
					 * context.
					 *
					 * @body
					 *
					 * ## Use
					 *
					 * It is common for you to want some data in the template to be available
					 * on an element.  `{{data name}}` allows you to save the
					 * context so it can later be retrieved by [can.data] or
					 * `$.fn.data`. For example,
					 *
					 * The template:
					 *
					 *     <ul>
					 *       <li id="person" {{data 'person'}}>{{name}}</li>
					 *     </ul>
					 *
					 * Rendered with:
					 *
					 *     document.body.appendChild(
					 *       can.view.mustache(template,{ person: { name: 'Austin' } });
					 *
					 * Retrieve the person data back with:
					 *
					 *     $("#person").data("person")
					 *
					 */
					{
						name: /^\s*data\s/,
						fn: function (content, cmd) {
							var attr = content.match(/["|'](.*)["|']/)[1];
							// return a function which calls `can.data` on the element
							// with the attribute name with the current context.
							return "can.proxy(function(__){" +
							// "var context = this[this.length-1];" +
							// "context = context." + STACKED + " ? context[context.length-2] : context; console.warn(this, context);" +
							"can.data(can.$(__),'" + attr + "', this.attr('.')); }, " + SCOPE + ")";
						}
					}, {
						name: /\s*\(([\$\w]+)\)\s*->([^\n]*)/,
						fn: function (content) {
							var quickFunc = /\s*\(([\$\w]+)\)\s*->([^\n]*)/,
								parts = content.match(quickFunc);

							//find 
							return "can.proxy(function(__){var " + parts[1] + "=can.$(__);with(" + SCOPE + ".attr('.')){" + parts[2] + "}}, this);";
						}
					},
					// ### Transformation (default)
					//
					// This transforms all content to its interpolated equivalent,
					// including calls to the corresponding helpers as applicable. 
					// This outputs the render code for almost all cases.
					//
					// #### Definitions
					// 
					// * `context` - This is the object that the current rendering context operates within. 
					//		Each nested template adds a new `context` to the context stack.
					// * `stack` - Mustache supports nested sections, 
					//		each of which add their own context to a stack of contexts.
					//		Whenever a token gets interpolated, it will check for a match against the 
					//		last context in the stack, then iterate through the rest of the stack checking for matches.
					//		The first match is the one that gets returned.
					// * `Mustache.txt` - This serializes a collection of logic, optionally contained within a section.
					//		If this is a simple interpolation, only the interpolation lookup will be passed.
					//		If this is a section, then an `options` object populated by the truthy (`options.fn`) and 
					//		falsey (`options.inverse`) encapsulated functions will also be passed. This section handling 
					//		exists to support the runtime context nesting that Mustache supports.
					// * `Mustache.get` - This resolves an interpolation reference given a stack of contexts.
					// * `options` - An object containing methods for executing the inner contents of sections or helpers.  
					//		`options.fn` - Contains the inner template logic for a truthy section.  
					//		`options.inverse` - Contains the inner template logic for a falsey section.  
					//		`options.hash` - Contains the merged hash object argument for custom helpers.
					//
					// #### Design
					//
					// This covers the design of the render code that the transformation helper generates.
					//
					// ##### Pseudocode
					// 
					// A detailed explanation is provided in the following sections, but here is some brief pseudocode
					// that gives a high level overview of what the generated render code does (with a template similar to  
					// `"{{#a}}{{b.c.d.e.name}}{{/a}}" == "Phil"`).
					//
					// *Initialize the render code.*
					// 
					// 		view = []
					// 		context = []
					// 		stack = fn { context.concat([this]) }
					// 		
					// *Render the root section.*
					//
					// 		view.push( "string" )
					// 		view.push( can.view.txt(
					//
					// *Render the nested section with `can.Mustache.txt`.*
					//
					// 			txt( 
					//
					// *Add the current context to the stack.*
					//
					// 				stack(), 
					//
					// *Flag this for truthy section mode.*
					//
					// 				"#",
					//
					// *Interpolate and check the `a` variable for truthyness using the stack with `can.Mustache.get`.*
					// 
					// 				get( "a", stack() ),
					//
					// *Include the nested section's inner logic.
					// The stack argument is usually the parent section's copy of the stack, 
					// but it can be an override context that was passed by a custom helper.
					// Sections can nest `0..n` times -- **NESTCEPTION**.*
					//
					// 				{ fn: fn(stack) {
					//
					// *Render the nested section (everything between the `{{#a}}` and `{{/a}}` tokens).*
					//
					// 					view = []
					// 					view.push( "string" )
					// 					view.push(
					//
					// *Add the current context to the stack.*
					//
					// 						stack(),
					//
					// *Flag this as interpolation-only mode.*
					//
					// 						null,
					//
					// *Interpolate the `b.c.d.e.name` variable using the stack.*
					//
					// 						get( "b.c.d.e.name", stack() ),
					// 					)
					// 					view.push( "string" )
					//
					// *Return the result for the nested section.*
					//
					// 					return view.join()
					// 				}}
					// 			)
					// 		))
					// 		view.push( "string" )
					//
					// *Return the result for the root section, which includes all nested sections.*
					//
					// 		return view.join()
					//
					// ##### Initialization
					//
					// Each rendered template is started with the following initialization code:
					//
					// 		var ___v1ew = [];
					// 		var ___c0nt3xt = [];
					// 		___c0nt3xt.__sc0pe = true;
					// 		var __sc0pe = function(context, self) {
					// 			var s;
					// 			if (arguments.length == 1 && context) {
					// 				s = !context.__sc0pe ? [context] : context;
					// 			} else {
					// 				s = context && context.__sc0pe 
					//					? context.concat([self]) 
					//					: __sc0pe(context).concat([self]);
					// 			}
					// 			return (s.__sc0pe = true) && s;
					// 		};
					//
					// The `___v1ew` is the the array used to serialize the view.
					// The `___c0nt3xt` is a stacking array of contexts that slices and expands with each nested section.
					// The `__sc0pe` function is used to more easily update the context stack in certain situations.
					// Usually, the stack function simply adds a new context (`self`/`this`) to a context stack. 
					// However, custom helpers will occasionally pass override contexts that need their own context stack.
					//
					// ##### Sections
					//
					// Each section, `{{#section}} content {{/section}}`, within a Mustache template generates a section 
					// context in the resulting render code. The template itself is treated like a root section, with the 
					// same execution logic as any others. Each section can have `0..n` nested sections within it.
					//
					// Here's an example of a template without any descendent sections.  
					// Given the template: `"{{a.b.c.d.e.name}}" == "Phil"`  
					// Would output the following render code:
					//
					//		___v1ew.push("\"");
					//		___v1ew.push(can.view.txt(1, '', 0, this, function() {
					// 			return can.Mustache.txt(__sc0pe(___c0nt3xt, this), null, 
					//				can.Mustache.get("a.b.c.d.e.name", 
					//					__sc0pe(___c0nt3xt, this))
					//			);
					//		}));
					//		___v1ew.push("\" == \"Phil\"");
					//
					// The simple strings will get appended to the view. Any interpolated references (like `{{a.b.c.d.e.name}}`) 
					// will be pushed onto the view via `can.view.txt` in order to support live binding.
					// The function passed to `can.view.txt` will call `can.Mustache.txt`, which serializes the object data by doing 
					// a context lookup with `can.Mustache.get`.
					//
					// `can.Mustache.txt`'s first argument is a copy of the context stack with the local context `this` added to it.
					// This stack will grow larger as sections nest.
					//
					// The second argument is for the section type. This will be `"#"` for truthy sections, `"^"` for falsey, 
					// or `null` if it is an interpolation instead of a section.
					//
					// The third argument is the interpolated value retrieved with `can.Mustache.get`, which will perform the 
					// context lookup and return the approriate string or object.
					//
					// Any additional arguments, if they exist, are used for passing arguments to custom helpers.
					//
					// For nested sections, the last argument is an `options` object that contains the nested section's logic.
					//
					// Here's an example of a template with a single nested section.  
					// Given the template: `"{{#a}}{{b.c.d.e.name}}{{/a}}" == "Phil"`  
					// Would output the following render code:
					//
					//		___v1ew.push("\"");
					// 		___v1ew.push(can.view.txt(0, '', 0, this, function() {
					// 			return can.Mustache.txt(__sc0pe(___c0nt3xt, this), "#", 
					//				can.Mustache.get("a", __sc0pe(___c0nt3xt, this)), 
					//					[{
					// 					_: function() {
					// 						return ___v1ew.join("");
					// 					}
					// 				}, {
					// 					fn: function(___c0nt3xt) {
					// 						var ___v1ew = [];
					// 						___v1ew.push(can.view.txt(1, '', 0, this, 
					//								function() {
					//                                  return can.Mustache.txt(
					// 									__sc0pe(___c0nt3xt, this), 
					// 									null, 
					// 									can.Mustache.get("b.c.d.e.name", 
					// 										__sc0pe(___c0nt3xt, this))
					// 								);
					// 							}
					// 						));
					// 						return ___v1ew.join("");
					// 					}
					// 				}]
					//			)
					// 		}));
					//		___v1ew.push("\" == \"Phil\"");
					//
					// This is specified as a truthy section via the `"#"` argument. The last argument includes an array of helper methods used with `options`.
					// These act similarly to custom helpers: `options.fn` will be called for truthy sections, `options.inverse` will be called for falsey sections.
					// The `options._` function only exists as a dummy function to make generating the section nesting easier (a section may have a `fn`, `inverse`,
					// or both, but there isn't any way to determine that at compilation time).
					// 
					// Within the `fn` function is the section's render context, which in this case will render anything between the `{{#a}}` and `{{/a}}` tokens.
					// This function has `___c0nt3xt` as an argument because custom helpers can pass their own override contexts. For any case where custom helpers
					// aren't used, `___c0nt3xt` will be equivalent to the `__sc0pe(___c0nt3xt, this)` stack created by its parent section. The `inverse` function
					// works similarly, except that it is added when `{{^a}}` and `{{else}}` are used. `var ___v1ew = []` is specified in `fn` and `inverse` to 
					// ensure that live binding in nested sections works properly.
					//
					// All of these nested sections will combine to return a compiled string that functions similar to EJS in its uses of `can.view.txt`.
					//
					// #### Implementation
					{
						name: /^.*$/,
						fn: function (content, cmd) {
							var mode = false,
								result = {
									content: "",
									startTxt: false,
									startOnlyTxt: false,
									end: false
								};

							// Trim the content so we don't have any trailing whitespace.
							content = can.trim(content);

							// Determine what the active mode is.
							// 
							// * `#` - Truthy section
							// * `^` - Falsey section
							// * `/` - Close the prior section
							// * `else` - Inverted section (only exists within a truthy/falsey section)
							if (content.length && (mode = content.match(/^([#^/]|else$)/))) {
								mode = mode[0];
								switch (mode) {
									/**
									 * @function can.mustache.helpers.section {{#key}}
									 * @parent can.mustache.tags 3
									 *
									 * @signature `{{#key}}BLOCK{{/key}}`
									 *
									 * Render blocks of text one or more times, depending
									 * on the value of the key in the current context.
									 *
									 * @param {can.mustache.key} key A key that references a value within the current or parent
									 * [can.mustache.context context]. If the value is a function or [can.compute], the
									 * function's return value is used.
									 *
									 *
									 * @return {String}
									 *
									 * Depending on the value's type, the following actions happen:
									 *
									 * - `Array` or [can.List] - the block is rendered for
									 *   each item in the array. The [can.mustache.context context] is set to
									 *   the item within each block rendering.
									 * - A `truthy` value - the block is rendered with the [can.mustache.context context]
									 *   set to the value.
									 * - A `falsey` value - the block is not rendered.
									 *
									 * The rendered result of the blocks, block or an empty string is returned.
									 *
									 * @body
									 *
									 * Sections contain text blocks and evaluate whether to render it or not.  If
									 * the object evaluates to an array it will iterate over it and render the block
									 * for each item in the array.  There are four different types of sections.
									 *
									 * ## Falseys or Empty Arrays
									 *
									 * If the value returns a `false`, `undefined`, `null`, `""` or `[]` we consider
									 * that a *falsey* value.
									 *
									 * If the value is falsey, the section will **NOT** render the block.
									 *
									 *     {
									 *       friends: false
									 *     }
									 *
									 *     {{#friends}}
									 *       Never shown!
									 *     {{/friends}}
									 *
									 *
									 * ## Arrays
									 *
									 * If the value is a non-empty array, sections will iterate over the
									 * array of items, rendering the items in the block.
									 *
									 * For example, a list of friends will iterate
									 * over each of those items within a section.
									 *
									 *     {
									 *         friends: [
									 *             { name: "Austin" },
									 *             { name: "Justin" }
									 *         ]
									 *     }
									 *
									 *     <ul>
									 *         {{#friends}}
									 *             <li>{{name}}</li>
									 *         {{/friends}}
									 *     </ul>
									 *
									 * would render:
									 *
									 *     <ul>
									 *         <li>Austin</li>
									 *         <li>Justin</li>
									 *     </ul>
									 *
									 * Reminder: Sections will reset the current context to the value for which it is iterating.
									 * See the [basics of contexts](#Basics) for more information.
									 *
									 * ## Truthys
									 *
									 * When the value is a non-falsey object but not a list, it is considered truthy and will be used
									 * as the context for a single rendering of the block.
									 *
									 *     {
									 *         friends: { name: "Jon" }
									 *     }
									 *
									 *     {{#friends}}
									 *         Hi {{name}}
									 *     {{/friends}}
									 *
									 * would render:
									 *
									 *     Hi Jon!
									 */
									// 
									/**
									 * @function can.mustache.helpers.helper {{helper args hashes}}
									 * @parent can.mustache.htags 0
									 *
									 * @description Calls a mustache helper function and inserts its return value into
									 * the rendered template.
									 *
									 * @signature `{{helper [args...] [hashProperty=hashValue...]}}`
									 *
									 * Calls a mustache helper function or a function. For example:
									 *
									 * The template:
									 *
									 *     <p>{{madLib "Lebron James" verb 4 foo="bar"}}</p>
									 *
									 * Rendered with:
									 *
									 *     {verb: "swept"}
									 *
									 * Will call a `madLib` helper with the following arguements:
									 *
									 *     can.mustache.registerHelper('madLib',
									 *       function(subject, verb, number, options){
									 *         // subject -> "Lebron James"
									 *         // verb -> "swept"
									 *         // number -> 4
									 *         // options.hash.foo -> "bar"
									 *     });
									 *
									 * @param {can.mustache.key} helper A key that finds a [can.mustache.helper helper function]
									 * that is either [can.mustache.registerHelper registered] or found within the
									 * current or parent [can.mustache.context context].
									 *
									 * @param {...can.mustache.key|String|Number} [args] Space seperated arguments
									 * that get passed to the helper function as arguments. If the key's value is a:
									 *
									 *  - [can.Map] - A getter/setter [can.compute] is passed.
									 *  - [can.compute] - The can.compute is passed.
									 *  - `function` - The function's return value is passed.
									 *
									 * @param {String} hashProperty
									 *
									 * A property name that gets added to a [can.mustache.helperOptions helper options]'s
									 * hash object.
									 *
									 * @param {...can.mustache.key|String|Number} hashValue A value that gets
									 * set as a property value of the [can.mustache.helperOptions helper option argument]'s
									 * hash object.
									 *
									 * @body
									 *
									 * ## Use
									 *
									 * The `{{helper}}` syntax is used to call out to Mustache [can.mustache.helper helper functions] functions
									 * that may contain more complex functionality. `helper` is a [can.mustache.key key] that must match either:
									 *
									 *  - a [can.mustache.registerHelper registered helper function], or
									 *  - a function in the current or parent [can.mustache.context contexts]
									 *
									 * The following example shows both cases.
									 *
									 * The Template:
									 *
									 *     <p>{{greeting}} {{user}}</p>
									 *
									 * Rendered with data:
									 *
									 *     {
									 *       user: function(){ return "Justin" }
									 *     }
									 *
									 * And a with a registered helper like:
									 *
									 *     can.mustache.registerHelper('greeting', function(){
									 *       return "Hello"
									 *     });
									 *
									 * Results in:
									 *
									 *     <p>Hello Justin</p>
									 *
									 * ## Arguments
									 *
									 * Arguments can be passed from the template to helper function by
									 * listing space seperated strings, numbers or other [can.mustache.key keys] after the
									 * `helper` name.  For example:
									 *
									 * The template:
									 *
									 *     <p>{{madLib "Lebron James" verb 4}}</p>
									 *
									 * Rendered with:
									 *
									 *     {verb: "swept"}
									 *
									 * Will call a `madLib` helper with the following arguements:
									 *
									 *     can.mustache.registerHelper('madLib',
									 *       function(subject, verb, number, options){
									 *         // subject -> "Lebron James"
									 *         // verb -> "swept"
									 *         // number -> 4
									 *     });
									 *
									 * If an argument `key` value is a [can.Map] property, the Observe's
									 * property is converted to a getter/setter [can.compute]. For example:
									 *
									 * The template:
									 *
									 *     <p>What! My name is: {{mr user.name}}</p>
									 *
									 * Rendered with:
									 *
									 *     {user: new can.Map({name: "Slim Shady"})}
									 *
									 * Needs the helper to check if name is a function or not:
									 *
									 *     can.mustache.registerHelper('mr',function(name){
									 *       return "Mr. "+ (typeof name === "function" ?
									 *                       name():
									 *                       name)
									 *     })
									 *
									 * This behavior enables two way binding helpers and is explained in more detail
									 * on the [can.mustache.helper helper functions] docs.
									 *
									 * ## Hash
									 *
									 * If enumerated arguments isn't an appropriate way to configure the behavior
									 * of a helper, it's possible to pass a hash of key-value pairs to the
									 * [can.mustache.helperOptions helper option argument]'s
									 * hash object.  Properties and values are specified
									 * as `hashProperty=hashValue`.  For example:
									 *
									 * The template:
									 *
									 *     <p>My {{excuse who=pet how="shreded"}}</p>
									 * `
									 * And the helper:
									 *
									 *     can.mustache.registerHelper("excuse",function(options){
									 *       return ["My",
									 *         options.hash.who || "dog".
									 *         options.hash.how || "ate",
									 *         "my",
									 *         options.hash.what || "homework"].join(" ")
									 *     })
									 *
									 * Render with:
									 *
									 *     {pet: "cat"}
									 *
									 * Results in:
									 *
									 *     <p>My cat shareded my homework</p>
									 *
									 * ## Returning an element callback function
									 *
									 * If a helper returns a function, that function is called back after
									 * the template has been rendered into DOM elements. This can
									 * be used to create mustache tags that have rich behavior. Read about it
									 * on the [can.mustache.helper helper function] page.
									 *
									 */
									// 
									/**
									 * @function can.mustache.helpers.sectionHelper {{#helper args hashes}}
									 * @parent can.mustache.htags 1
									 *
									 * Calls a mustache helper function with a block, and optional inverse
									 * block.
									 *
									 * @signature `{{#helper [args...] [hashName=hashValue...]}}BLOCK{{/helper}}`
									 *
									 * Calls a mustache helper function or a function with a block to
									 * render.
									 *
									 * The template:
									 *
									 *     <p>{{countTo number}}{{num}}{{/countTo}}</p>
									 *
									 * Rendered with:
									 *
									 *     {number: 5}
									 *
									 * Will call the `countTo` helper:
									 *
									 *     can.mustache.registerHelper('madLib',
									 *       function(number, options){
									 *         var out = []
									 *         for(var i =0; i < number; i++){
									 *           out.push( options.fn({num: i+1}) )
									 *         }
									 *         return out.join(" ")
									 *     });
									 *
									 * Results in:
									 *
									 *     <p>1 2 3 4 5</p>
									 *
									 * @param {can.mustache.key} helper A key that finds a [can.mustache.helper helper function]
									 * that is either [can.mustache.registerHelper registered] or found within the
									 * current or parent [can.mustache.context context].
									 *
									 * @param {...can.mustache.key|String|Number} [args] Space seperated arguments
									 * that get passed to the helper function as arguments. If the key's value is a:
									 *
									 *  - [can.Map] - A getter/setter [can.compute] is passed.
									 *  - [can.compute] - The can.compute is passed.
									 *  - `function` - The function's return value is passed.
									 *
									 * @param {String} hashProperty
									 *
									 * A property name that gets added to a [can.mustache.helperOptions helper options]'s
									 * hash object.
									 *
									 * @param {...can.mustache.key|String|Number} hashValue A value that gets
									 * set as a property value of the [can.mustache.helperOptions helper option argument]'s
									 * hash object.
									 *
									 * @param {mustache} BLOCK A mustache template that gets compiled and
									 * passed to the helper function as the [can.mustache.helperOptions options argument's] `fn`
									 * property.
									 *
									 *
									 * @signature `{{#helper [args...] [hashName=hashValue...]}}BLOCK{{else}}INVERSE{{/helper}}`
									 *
									 * Calls a mustache helper function or a function with a `fn` and `inverse` block to
									 * render.
									 *
									 * The template:
									 *
									 *     <p>The bed is
									 *        {{isJustRight firmness}}
									 *           pefect!
									 *        {{else}}
									 *           uncomfortable.
									 *        {{/justRight}}</p>
									 *
									 * Rendered with:
									 *
									 *     {firmness: 45}
									 *
									 * Will call the `isJustRight` helper:
									 *
									 *     can.mustache.registerHelper('isJustRight',
									 *       function(number, options){
									 *         if(number > 50){
									 *           return options.fn(this)
									 *         } else {
									 *           return options.inverse(this)
									 *         }
									 *         return out.join(" ")
									 *     });
									 *
									 * Results in:
									 *
									 *     <p>The bed is uncomfortable.</p>
									 *
									 * @param {can.mustache.key} helper A key that finds a [can.mustache.helper helper function]
									 * that is either [can.mustache.registerHelper registered] or found within the
									 * current or parent [can.mustache.context context].
									 *
									 * @param {...can.mustache.key|String|Number} [args] Space seperated arguments
									 * that get passed to the helper function as arguments. If the key's value is a:
									 *
									 *  - [can.Map] - A getter/setter [can.compute] is passed.
									 *  - [can.compute] - The can.compute is passed.
									 *  - `function` - The function's return value is passed.
									 *
									 * @param {String} hashProperty
									 *
									 * A property name that gets added to a [can.mustache.helperOptions helper options]'s
									 * hash object.
									 *
									 * @param {...can.mustache.key|String|Number} hashValue A value that gets
									 * set as a property value of the [can.mustache.helperOptions helper option argument]'s
									 * hash object.
									 *
									 * @param {mustache} BLOCK A mustache template that gets compiled and
									 * passed to the helper function as the [can.mustache.helperOptions options argument's] `fn`
									 * property.
									 *
									 * @param {mustache} INVERSE A mustache template that gets compiled and
									 * passed to the helper function as the [can.mustache.helperOptions options argument's] `inverse`
									 * property.
									 *
									 *
									 * @body
									 *
									 * ## Use
									 *
									 * Read the [use section of {{helper}}](can.mustache.helpers.helper.html#section_Use) to better understand how:
									 *
									 *  - [Helper functions are found](can.mustache.helpers.helper.html#section_Arguments)
									 *  - [Arguments are passed to the helper](can.mustache.helpers.helper.html#section_Arguments)
									 *  - [Hash values are passed to the helper](can.mustache.helpers.helper.html#section_Hash)
									 *
									 * Read how [helpers that return functions](can.mustache.helper.html#section_Returninganelementcallbackfunction) can
									 * be used for rich behavior like 2-way binding.
									 *
									 */
									// Open a new section.
								case '#':
									/**
									 * @function can.mustache.helpers.inverse {{^key}}
									 * @parent can.mustache.tags 5
									 *
									 * @signature `{{^key}}BLOCK{{/key}}`
									 *
									 * Render blocks of text if the value of the key
									 * is falsey.  An inverted section syntax is similar to regular
									 * sections except it begins with a caret rather than a
									 * pound. If the value referenced is falsey, the section will render.
									 *
									 * @param {can.mustache.key} key A key that references a value within the current or parent
									 * [can.mustache.context context]. If the value is a function or [can.compute], the
									 * function's return value is used.
									 *
									 * @return {String}
									 *
									 * Depending on the value's type, the following actions happen:
									 *
									 * - A `truthy` value - the block is not rendered.
									 * - A `falsey` value - the block is rendered.
									 *
									 * The rendered result of the block or an empty string is returned.
									 *
									 * @body
									 *
									 * ## Use
									 *
									 * Inverted sections match falsey values. An inverted section
									 * syntax is similar to regular sections except it begins with a caret
									 * rather than a pound. If the value referenced is falsey, the section
									 * will render. For example:
									 *
									 *
									 * The template:
									 *
									 *     <ul>
									 *         {{#friends}}
									 *             </li>{{name}}</li>
									 *         {{/friends}}
									 *         {{^friends}}
									 *             <li>No friends.</li>
									 *         {{/friends}}
									 *     </ul>
									 *
									 * And data:
									 *
									 *     {
									 *         friends: []
									 *     }
									 *
									 * Results in:
									 *
									 *
									 *     <ul>
									 *         <li>No friends.</li>
									 *     </ul>
									 */
								case '^':
									if (cmd.specialAttribute) {
										result.startOnlyTxt = true;
										//result.push(cmd.insert + 'can.view.onlytxt(this,function(){ return ');
									} else {
										result.startTxt = true;
										// sections should never be escaped
										result.escaped = 0;
										//result.push(cmd.insert + 'can.view.txt(0,\'' + cmd.tagName + '\',' + cmd.status + ',this,function(){ return ');
									}
									break;
									// Close the prior section.
									/**
									 * @function can.mustache.helpers.close {{/key}}
									 * @parent can.mustache.tags 4
									 *
									 * @signature `{{/key}}`
									 *
									 * Ends a [can.mustache.helpers.section {{#key}}] or [can.mustache.helpers.sectionHelper {{#helper}}]
									 * block.
									 *
									 * @param {can.mustache.key} [key] A key that matches the opening key or helper name. It's also
									 * possible to simply write `{{/}}` to end a block.
									 */
								case '/':
									result.end = true;
									result.content += 'return ___v1ew.join("");}}])';
									return result;
								}

								// Trim the mode off of the content.
								content = content.substring(1);
							}

							// `else` helpers are special and should be skipped since they don't 
							// have any logic aside from kicking off an `inverse` function.
							if (mode !== 'else') {
								var args = [],
									hashes = [],
									i = 0,
									m;

								// Start the content render block.
								result.content += 'can.Mustache.txt(\n' +
									(cmd.specialAttribute ? SPECIAL_CONTEXT_OBJ : CONTEXT_OBJ ) +
									',\n' + (mode ? '"' + mode + '"' : 'null') + ',';

								// Parse the helper arguments.
								// This needs uses this method instead of a split(/\s/) so that 
								// strings with spaces can be correctly parsed.
								(can.trim(content) + ' ')
									.replace(argumentsRegExp, function (whole, arg) {

										// Check for special helper arguments (string/number/boolean/hashes).
										if (i && (m = arg.match(literalNumberStringBooleanRegExp))) {
											// Found a native type like string/number/boolean.
											if (m[2]) {
												args.push(m[0]);
											}
											// Found a hash object.
											else {
												// Addd to the hash object.

												hashes.push(m[4] + ":" + (m[6] ? m[6] : makeLookupLiteral(m[5])));
											}
										}
										// Otherwise output a normal interpolation reference.
										else {
											args.push(makeLookupLiteral(arg));
										}
										i++;
									});

								result.content += args.join(",");
								if (hashes.length) {
									result.content += ",{" + HASH + ":{" + hashes.join(",") + "}}";
								}

							}

							// Create an option object for sections of code.
							if (mode && mode !== 'else') {
								result.content += ',[\n\n';
							}
							switch (mode) {
								// Truthy section
							case '^':
							case '#':
								result.content += ('{fn:function(' + ARG_NAMES + '){var ___v1ew = [];');
								break;
								// If/else section
								// Falsey section
								/**
								 * @function can.mustache.helpers.else {{else}}
								 * @parent can.mustache.htags 3
								 *
								 * @signature `{{#helper}}BLOCK{{else}}INVERSE{{/helper}}`
								 *
								 * Creates an `inverse` block for a [can.mustache.helper helper function]'s
								 * [can.mustache.helperOptions options argument]'s `inverse` property.
								 *
								 * @param {can.mustache} INVERSE a mustache template coverted to a
								 * function and set as the [can.mustache.helper helper function]'s
								 * [can.mustache.helperOptions options argument]'s `inverse` property.
								 *
								 * @body
								 *
								 * ## Use
								 *
								 * For more information on how `{{else}}` is used checkout:
								 *
								 *  - [can.mustache.helpers.if {{if key}}]
								 *  - [can.mustache.helpers.sectionHelper {{#helper}}]
								 *
								 */
							case 'else':
								result.content += 'return ___v1ew.join("");}},\n{inverse:function(' + ARG_NAMES + '){\nvar ___v1ew = [];';
								break;

								// Not a section, no mode
							default:
								result.content += (')');
								break;
							}

							if (!mode) {
								result.startTxt = true;
								result.end = true;
							}

							return result;
						}
					}
				]
			})
		});

		// Add in default scanner helpers first.
		// We could probably do this differently if we didn't 'break' on every match.
		var helpers = can.view.Scanner.prototype.helpers;
		for (var i = 0; i < helpers.length; i++) {
			Mustache.prototype.scanner.helpers.unshift(helpers[i]);
		}

		/**
		 * @function can.MustacheConstructor.txt
		 * @hide
		 *
		 * Evaluates the resulting string based on the context/name.
		 *
		 * @param {Object|Array} context	The context stack to be used with evaluation.
		 * @param {String} mode		The mode to evaluate the section with: # for truthy, ^ for falsey
		 * @param {String|Object} name	The string (or sometimes object) to pass to the given helper method.
		 */
		Mustache.txt = function (scopeAndOptions, mode, name) {

			// here we are going to cache the lookup values so future calls are much faster
			var scope = scopeAndOptions.scope,
				options = scopeAndOptions.options,
				args = [],
				helperOptions = {
					fn: function () {},
					inverse: function () {}
				},
				hash,
				context = scope.attr("."),
				getHelper = true,
				helper;

			// convert lookup values to actual values in name, arguments, and hash
			for (var i = 3; i < arguments.length; i++) {
				var arg = arguments[i];
				if (mode && can.isArray(arg)) {
					// merge into options
					helperOptions = can.extend.apply(can, [helperOptions].concat(arg));
				} else if (arg && arg[HASH]) {
					hash = arg[HASH];
					// get values on hash
					for (var prop in hash) {
						if (isLookup(hash[prop])) {
							hash[prop] = Mustache.get(hash[prop].get, scopeAndOptions, false, true);
						}
					}
				} else if (arg && isLookup(arg)) {
					args.push(Mustache.get(arg.get, scopeAndOptions, false, true, true));
				} else {
					args.push(arg);
				}
			}

			if (isLookup(name)) {
				var get = name.get;
				name = Mustache.get(name.get, scopeAndOptions, args.length, false);

				// Base whether or not we will get a helper on whether or not the original
				// name.get and Mustache.get resolve to the same thing. Saves us from running
				// into issues like {{text}} / {text: 'with'}
				getHelper = (get === name);
			}

			// overwrite fn and inverse to always convert to scopes
			helperOptions.fn = makeConvertToScopes(helperOptions.fn, scope, options);
			helperOptions.inverse = makeConvertToScopes(helperOptions.inverse, scope, options);

			// if mode is ^, swap fn and inverse
			if(mode === '^') {
				var tmp = helperOptions.fn;
				helperOptions.fn = helperOptions.inverse;
				helperOptions.inverse = tmp;
			}

			// Check for a registered helper or a helper-like function.
			if (helper = (getHelper && (typeof name === "string" && Mustache.getHelper(name, options)) || (can.isFunction(name) && !name.isComputed && {
				fn: name
			}))) {
				// Add additional data to be used by helper functions

				can.extend(helperOptions, {
					context: context,
					scope: scope,
					contexts: scope,
					hash: hash
				});

				args.push(helperOptions);
				// Call the helper.
				return function () {
					return helper.fn.apply(context, args) || '';
				};

			}
			/*if( !mode && !args.length && can.isFunction(name) && name.isComputed ) {
				if(!scopeAndOptions.special) {
					name.canReadForChangeEvent = false;
				}
				return name;
			}*/
			return function () {
				//{{#foo.bar zed ted}}
				var value;
				if (can.isFunction(name) && name.isComputed) {
					value = name();
				} else {
					value = name;
				}
				// An array of arguments to check for truthyness when evaluating sections.
				var validArgs = args.length ? args : [value],
					// Whether the arguments meet the condition of the section.
					valid = true,
					result = [],
					i, argIsObserve, arg;
				// Validate the arguments based on the section mode.
				if (mode) {
					for (i = 0; i < validArgs.length; i++) {
						arg = validArgs[i];
						argIsObserve = typeof arg !== 'undefined' && isObserveLike(arg);
						// Array-like objects are falsey if their length = 0.
						if (isArrayLike(arg)) {
							// Use .attr to trigger binding on empty lists returned from function
							if (mode === '#') {
								valid = valid && !! (argIsObserve ? arg.attr('length') : arg.length);
							} else if (mode === '^') {
								valid = valid && !(argIsObserve ? arg.attr('length') : arg.length);
							}
						}
						// Otherwise just check if it is truthy or not.
						else {
							valid = mode === '#' ? valid && !! arg : mode === '^' ? valid && !arg : valid;
						}
					}
				}

				// Otherwise interpolate like normal.
				if (valid) {

					if (mode === "#") {
						if (isArrayLike(value)) {
							var isObserveList = isObserveLike(value);

							// Add the reference to the list in the contexts.
							for (i = 0; i < value.length; i++) {
								result.push(helperOptions.fn(
									isObserveList ? value.attr('' + i) : value[i]));
							}
							return result.join('');
						}
						// Normal case.
						else {
							return helperOptions.fn(value || {}) || '';
						}
					} else if (mode === "^") {
						return helperOptions.inverse(value || {}) || '';
					} else {
						return '' + (value != null ? value : '');
					}
				}

				return '';
			};
		};

		/**
		 * @function can.MustacheConstructor.get
		 * @hide
		 *
		 * Resolves a key for a given object (and then a context if that fails).
		 *
		 *     obj = this
		 *     context = { a: true }
		 *     ref = 'a.b.c'
		 *          => obj.a.b.c || context.a.b.c || ''
		 *
		 * This implements the following Mustache specs:
		 * Deeply Nested Contexts
		 * All elements on the context stack should be accessible.
		 *
		 *     {{#bool}}B {{#bool}}C{{/bool}} D{{/bool}}
		 *     { bool: true }
		 *     => "B C D"
		 *
		 * Basic Context Miss Interpolation
		 * Failed context lookups should default to empty strings.
		 *
		 *     {{cannot}}
		 *     => ""
		 *
		 * Dotted Names - Broken Chains
		 * Any falsey value prior to the last part of the name should yield ''.
		 *		{{a.b.c}}
		 *		{ a: { d: 1 } }
		 *		=> ""
		 *
		 * @param {can.mustache.key} key The reference to check for on the obj/context.
		 * @param {Object} obj The object to use for checking for a reference.
		 * @param {Object} context The context to use for checking for a reference if it doesn't exist in the object.
		 * @param {Boolean} [isHelper] Whether the reference is seen as a helper.
		 */
		Mustache.get = function (key, scopeAndOptions, isHelper, isArgument, isLookup) {

			// Cache a reference to the current context and options, we will use them a bunch.
			var context = scopeAndOptions.scope.attr('.'),
				options = scopeAndOptions.options || {};

			// If key is called as a helper,
			if (isHelper) {
				// try to find a registered helper.
				if (Mustache.getHelper(key, options)) {
					return key;
				}
				// Support helper-like functions as anonymous helpers.
				// Check if there is a method directly in the "top" context.
				if (scopeAndOptions.scope && can.isFunction(context[key])) {
					return context[key];
				}

				//!steal-remove-start
				can.dev.warn('can/view/mustache/mustache.js: Unable to find helper "' + key + '".');
				//!steal-remove-end
			}

			// Get a compute (and some helper data) that represents key's value in the current scope
			var computeData = scopeAndOptions.scope.computeData(key, {
				isArgument: isArgument,
				args: [context, scopeAndOptions.scope]
			}),
				compute = computeData.compute;

			// Bind on the compute to cache its value. We will unbind in a timeout later.
			can.compute.temporarilyBind(compute);

			// computeData gives us an initial value
			var initialValue = computeData.initialValue,
				helperObj = Mustache.getHelper(key, options);
			  
			//!steal-remove-start
			if (initialValue === undefined && !isHelper && !helperObj) {
				can.dev.warn('can/view/mustache/mustache.js: Unable to find key "' + key + '".');
			}
			//!steal-remove-end

			// Use helper over the found value if the found value isn't in the current context
			if (!isLookup && (initialValue === undefined || computeData.scope !== scopeAndOptions.scope) && Mustache.getHelper(key, options)) {
				return key;
			}

			// If there are no dependencies, just return the value.
			if (!compute.computeInstance.hasDependencies) {
				return initialValue;
			} else {
				return compute;
			}
		};

		/**
		 * @hide
		 *
		 * Resolves an object to its truthy equivalent.
		 *
		 * @param {Object} value    The object to resolve.
		 * @return {Object} The resolved object.
		 */
		Mustache.resolve = function (value) {
			if (isObserveLike(value) && isArrayLike(value) && value.attr('length')) {
				return value;
			} else if (can.isFunction(value)) {
				return value();
			} else {
				return value;
			}
		};

		/**
		 * @static
		 */

		can.view.Options = can.view.Scope.extend({
			init: function (data, parent) {
				if (!data.helpers && !data.partials && !data.tags) {
					data = {
						helpers: data
					};
				}
				can.view.Scope.prototype.init.apply(this, arguments);
			}
		});

		// ## Helpers
		//
		// Helpers are functions that can be called from within a template.
		// These helpers differ from the scanner helpers in that they execute
		// at runtime instead of during compilation.
		//
		// Custom helpers can be added via `can.Mustache.registerHelper`,
		// but there are also some built-in helpers included by default.
		// Most of the built-in helpers are little more than aliases to actions 
		// that the base version of Mustache simply implies based on the 
		// passed in object.
		// 
		// Built-in helpers:
		// 
		// * `data` - `data` is a special helper that is implemented via scanning helpers. 
		//		It hooks up the active element to the active data object: `<div {{data "key"}} />`
		// * `if` - Renders a truthy section: `{{#if var}} render {{/if}}`
		// * `unless` - Renders a falsey section: `{{#unless var}} render {{/unless}}`
		// * `each` - Renders an array: `{{#each array}} render {{this}} {{/each}}`
		// * `with` - Opens a context section: `{{#with var}} render {{/with}}`
		Mustache._helpers = {};
		/**
		 * @function can.mustache.registerHelper
		 * @parent can.mustache.methods
		 * @description Register a helper.
		 * @function can.mustache.registerHelper registerHelper
		 * @signature `Mustache.registerHelper(name, helper)`
		 * @param {String} name The name of the helper.
		 * @param {can.mustache.helper} helper The helper function.
		 *
		 * @body
		 * Registers a helper with the Mustache system.
		 * Pass the name of the helper followed by the
		 * function to which Mustache should invoke.
		 * These are run at runtime.
		 */
		Mustache.registerHelper = function (name, fn) {
			this._helpers[name] = {
				name: name,
				fn: fn
			};
		};

		/**
		 * @hide
		 * @function can.MustacheConstructor.getHelper getHelper
		 * @description Retrieve a helper.
		 * @signature `Mustache.getHelper(name)`
		 * @param {String} name The name of the helper.
		 * @return {Function|null} The helper, or `null` if
		 * no helper by that name is found.
		 *
		 * @body
		 * Returns a helper given the name.
		 */
		Mustache.getHelper = function (name, options) {
			var helper;
			if (options) {
				helper = options.attr("helpers." + name);
			}
			return helper ? {
				fn: helper
			} : this._helpers[name];
		};

		/**
		 * @function can.MustacheConstructor.static.render render
		 * @hide
		 * @parent can.Mustache.static
		 * @signature `Mustache.render(partial, context)`
		 * @param {Object} partial
		 * @param {can.view.Scope} scope
		 *
		 * @body
		 * `Mustache.render` is a helper method that calls
		 * into `can.view.render` passing the partial
		 * and the context object.
		 *
		 * Its purpose is to determine if the partial object
		 * being passed represents a template like:
		 *
		 *     partial === "movember.mustache"
		 *
		 * or if the partial is a variable name that represents
		 * a partial on the context object such as:
		 *
		 *     context[partial] === "movember.mustache"
		 */
		Mustache.render = function (partial, scope, options) {
			// TOOD: clean up the following
			// If there is a "partial" property and there is not
			// an already-cached partial, we use the value of the 
			// property to look up the partial

			// if this partial is not cached ...
			if (!can.view.cached[partial]) {
				// we don't want to bind to changes so clear and restore reading
				var reads = can.__clearReading();
				var scopePartialName = scope.attr(partial);
				if (scopePartialName) {
					partial = scopePartialName;
				}
				can.__setReading(reads);
			}

			// Call into `can.view.render` passing the
			// partial and scope.
			return can.view.render(partial, scope, options);
		};

		/**
		 * @function can.mustache.safeString
		 * @parent can.mustache.methods
		 * 
		 * @signature `can.mustache.safeString(str)`
		 *
		 * @param {String} str A string you don't want to become escaped.
		 * @return {String} A string flagged by `can.mustache` as safe, which will
		 * not become escaped, even if you use [can.mustache.tags.unescaped](triple slash).
		 *
		 * @body
		 * If you write a helper that generates its own HTML, you will
		 * usually want to return a `can.mustache.safeString.` In this case,
		 * you will want to manually escape parameters with `[can.esc].`
		 *
		 * ```
		 * can.mustache.registerHelper('link', function(text, url) {
		 *   text = can.esc(text);
		 *   url  = can.esc(url);
		 *
		 *   var result = '<a href="' + url + '">' + text + '</a>';
		 *   return can.mustache.safeString(result);
		 * });
		 * ```
		 *
		 * Rendering:
		 * ```
		 * <div>{{link "Google", "http://google.com"}}</div>
		 * ```
		 *
		 * Results in:
		 *
		 * ```
		 * <div><a href="http://google.com">Google</a></div>
		 * ```
		 *
		 * As an anchor tag whereas if we would have just returned the result rather than a
		 * `can.mustache.safeString` our template would have rendered a div with the escaped anchor tag.
		 *
		 */
		Mustache.safeString = function (str) {
			return {
				toString: function () {
					return str;
				}
			};
		};

		Mustache.renderPartial = function (partialName, scope, options) {
			var partial = options.attr("partials." + partialName);
			if (partial) {
				return partial.render ? partial.render(scope, options) :
					partial(scope, options);
			} else {
				return can.Mustache.render(partialName, scope, options);
			}
		};

		// The built-in Mustache helpers.
		can.each({
			// Implements the `if` built-in helper.
			/**
			 * @function can.mustache.helpers.if {{#if key}}
			 * @parent can.mustache.htags 2
			 * @signature `{{#if key}}BLOCK{{/if}}`
			 *
			 * Renders the `BLOCK` template within the current template.
			 *
			 * @param {can.mustache.key} key A key that references a value within the current or parent
			 * context. If the value is a function or can.compute, the function's return value is used.
			 *
			 * @param {can.mustache} BLOCK A mustache template.
			 *
			 * @return {String} If the key's value is truthy, the `BLOCK` is rendered with the
			 * current context and its value is returned; otherwise, an empty string.
			 *
			 * @body
			 *
			 * ## Use
			 *
			 * `{{#if key}}` provides explicit conditional truthy tests. For example,
			 *
			 * The template:
			 *
			 *     {{#if user.isFemale}}
			 *       {{#if user.isMarried}}
			 *         Mrs
			 *       {{/if}}
			 *       {{#if user.isSingle}}
			 *         Miss
			 *       {{/if}}
			 *     {{/if}}
			 *
			 * Rendered with:
			 *
			 *     {user: {isFemale: true, isMarried: true}}
			 *
			 * Results in:
			 *
			 *     Mrs
			 *
			 * If can be used with [can.mustache.helpers.else {{else}}] too. For example,
			 *
			 *     {{#if user.isFemale}}
			 *       {{#if user.isMarried}}
			 *         Mrs
			 *       {{else}}
			 *         Miss
			 *       {{/if}}
			 *     {{/if}}
			 *
			 * Rendered with:
			 *
			 *     {user: {isFemale: true, isMarried: false}}
			 *
			 * Results in:
			 *
			 *     Miss
			 */
			'if': function (expr, options) {
				var value;
				// if it's a function, wrap its value in a compute
				// that will only change values from true to false
				if (can.isFunction(expr)) {
					value = can.compute.truthy(expr)();
				} else {
					value = !! Mustache.resolve(expr);
				}

				if (value) {
					return options.fn(options.contexts || this);
				} else {
					return options.inverse(options.contexts || this);
				}
			},
			/**
			* @function can.stache.helpers.is {{#is expr1 expr2 expr3}}
			* @parent can.stache.htags 12
			*
			* @signature `{{#is expr1 expr2}}BLOCK{{/is}}`
			*
			* Renders the `BLOCK` template within the current template.
			*
			* @param {can.stache.expression} [expr...] An expression or key that references a
			* value within the current or parent
			*
			* @param {can.stache} BLOCK A template that is rendered
			* if the result of comparsion `expr1` and `expr2` value is truthy.
			*
			* @return {DocumentFragment} If the key's value is truthy, the `BLOCK` is rendered with the
			* current context and its value is returned; otherwise, an empty string.
			*
			* @body
			*
			* The `is` helper compares expr1 and expr2 and renders the blocks accordingly.
			*
			*	{{#is expr1 expr2}}
			*		// truthy
			*	{{else}}
			*		// falsey
			*	{{/is}}
			*/
			'is': function() {
				var lastValue, curValue,
					options = arguments[arguments.length - 1];

				if (arguments.length - 2 <= 0) {
					return options.inverse();
				}

				for (var i = 0; i < arguments.length - 1; i++) {
					curValue = Mustache.resolve(arguments[i]);
					curValue = can.isFunction(curValue) ? curValue() : curValue;

					if (i > 0) {
						if (curValue !== lastValue) {
							return options.inverse();
						}
					}
					lastValue = curValue;
				}

				return options.fn();
			},
			'eq': function() {
				return Mustache._helpers.is.fn.apply(this, arguments);
			},
			// Implements the `unless` built-in helper.
			/**
			 * @function can.mustache.helpers.unless {{#unless key}}
			 * @parent can.mustache.htags 4
			 *
			 * @signature `{{#unless key}}BLOCK{{/unless}}`
			 *
			 * Render the block of text if the key's value is falsey.
			 *
			 * @param {can.mustache.key} key A key that references a value within the current or parent
			 * context. If the value is a function or can.compute, the function's
			 * return value is used.
			 *
			 * @param {can.mustache} BLOCK A template that is rendered
			 * if the `key`'s value is falsey.
			 *
			 * @body
			 *
			 * The `unless` helper evaluates the inverse of the value
			 * of the key and renders the block between the helper and the slash.
			 *
			 *     {{#unless expr}}
			 *       // unless
			 *     {{/unless}}
			 */
			'unless': function (expr, options) {
				return Mustache._helpers['if'].fn.apply(this, [can.isFunction(expr) ? can.compute(function() { return !expr(); }) : !expr, options]);
			},

			// Implements the `each` built-in helper.
			/**
			 * @function can.mustache.helpers.each {{#each key}}
			 * @parent can.mustache.htags 5
			 *
			 * @signature `{{#each key}}BLOCK{{/each}}`
			 *
			 * Render the block of text for each item in key's value.
			 *
			 * @param {can.mustache.key} key A key that references a value within the current or parent
			 * context. If the value is a function or can.compute, the function's
			 * return value is used.
			 *
			 * If the value of the key is a [can.List], the resulting HTML is updated when the
			 * list changes. When a change in the list happens, only the minimum amount of DOM
			 * element changes occur.
			 *
			 * If the value of the key is a [can.Map], the resulting HTML is updated whenever
			 * attributes are added or removed. When a change in the map happens, only
			 * the minimum amount of DOM element changes occur.
			 *
			 * @param {can.mustache} BLOCK A template that is rendered for each item in
			 * the `key`'s value. The `BLOCK` is rendered with the context set to the item being rendered.
			 *
			 * @body
			 *
			 * ## Use
			 *
			 * Use the `each` helper to iterate over a array
			 * of items and render the block between the helper and the slash. For example,
			 *
			 * The template:
			 *
			 *     <ul>
			 *       {{#each friends}}
			 *         <li>{{name}}</li>
			 *       {{/each}}
			 *     </ul>
			 *
			 * Rendered with:
			 *
			 *     {friends: [{name: "Austin"},{name: "Justin"}]}
			 *
			 * Renders:
			 *
			 *     <ul>
			 *       <li>Austin</li>
			 *       <li>Justin</li>
			 *     </ul>
			 *
			 * ## Object iteration
			 *
			 * As of 2.1, you can now iterate over properties of objects and attributes with
			 * the `each` helper. When iterating over [can.Map] it will only iterate over the
			 * map's [keys](can.Map.keys.html) and none of the hidden properties of a can.Map. For example,
			 *
			 * The template:
			 *
			 *     <ul>
			 *       {{#each person}}
			 *         <li>{{.}}</li>
			 *       {{/each}}
			 *     </ul>
			 *
			 * Rendered with:
			 *
			 *     {person: {name: 'Josh', age: 27}}
			 *
			 * Renders:
			 *
			 *     <ul>
			 *       <li>Josh</li>
			 *       <li>27</li>
			 *     </ul>
			 */
			'each': function (expr, options) {
				// Check if this is a list or a compute that resolves to a list, and setup
				// the incremental live-binding 

				// First, see what we are dealing with.  It's ok to read the compute
				// because can.view.text is only temporarily binding to what is going on here.
				// Calling can.view.lists prevents anything from listening on that compute.
				var resolved = Mustache.resolve(expr),
					result = [],
					keys,
					key,
					i;

				// When resolved === undefined, the property hasn't been defined yet
				// Assume it is intended to be a list
				if (can.view.lists && (resolved instanceof can.List || (expr && expr.isComputed && resolved === undefined))) {
					return can.view.lists(expr, function (item, index) {
						return options.fn(options.scope.add({
								"@index": index
							})
							.add(item));
					});
				}
				expr = resolved;

				if ( !! expr && isArrayLike(expr)) {
					for (i = 0; i < expr.length; i++) {
						result.push(options.fn(options.scope.add({
								"@index": i
							})
							.add(expr[i])));
					}
					return result.join('');
				} else if (isObserveLike(expr)) {
					keys = can.Map.keys(expr);
					// listen to keys changing so we can livebind lists of attributes.

					for (i = 0; i < keys.length; i++) {
						key = keys[i];
						result.push(options.fn(options.scope.add({
								"@key": key
							})
							.add(expr[key])));
					}
					return result.join('');
				} else if (expr instanceof Object) {
					for (key in expr) {
						result.push(options.fn(options.scope.add({
								"@key": key
							})
							.add(expr[key])));
					}
					return result.join('');

				}
			},
			// Implements the `with` built-in helper.
			/**
			 * @function can.mustache.helpers.with {{#with key}}
			 * @parent can.mustache.htags 6
			 *
			 * @signature `{{#with key}}BLOCK{{/with}}`
			 *
			 * Changes the context within a block.
			 *
			 * @param {can.mustache.key} key A key that references a value within the current or parent
			 * context. If the value is a function or can.compute, the function's
			 * return value is used.
			 *
			 * @param {can.mustache} BLOCK A template that is rendered
			 * with the context of the `key`'s value.
			 *
			 * @body
			 *
			 * Mustache typically applies the context passed in the section
			 * at compiled time.  However, if you want to override this
			 * context you can use the `with` helper.
			 *
			 *     {{#with arr}}
			 *       // with
			 *     {{/with}}
			 */
			'with': function (expr, options) {
				var ctx = expr;
				expr = Mustache.resolve(expr);
				if ( !! expr) {
					return options.fn(ctx);
				}
			},
			/**
			 * @function can.mustache.helpers.log {{log}}
			 * @parent can.mustache.htags 9
			 *
			 * @signature `{{#log [message]}}`
			 *
			 * Logs the context of the current block with an optional message.
			 *
			 * @param {*} message An optional message to log out in addition to the
			 * current context.
			 *
			 */
			'log': function (expr, options) {
				if(typeof console !== "undefined" && console.log) {
					if (!options) {
						console.log(expr.context);
					} else {
						console.log(expr, options.context);
					}
				}
			},
			/**
			 * @function can.mustache.helpers.elementCallback {{(el)->CODE}}
			 *
			 * @parent can.mustache.htags 8
			 *
			 * @signature `{{(el) -> CODE}}`
			 *
			 * Executes an element callback with the inline code on the element.
			 *
			 * @param {String} code The inline code to execute on the element.
			 *
			 * @body
			 *
			 * ## Use
			 *
			 * It is common for you to want to execute some code on a given
			 * DOM element. An example would be for initializing a jQuery plugin
			 * on the new HTML.
			 *
			 *     <div class="tabs" {{(el) -> el.jquery_tabs()}}></div>
			 *
			 */
			//
			/**
			 * @function can.mustache.helpers.index {{@index}}
			 *
			 * @parent can.mustache.htags 10
			 *
			 * @signature `{{@index [offset]}}`
			 *
			 * Insert the index of an Array or can.List we are iterating on with [#each](can.mustache.helpers.each)
			 *
			 * @param {Number} offset The number to optionally offset the index by.
			 *
			 * @body
			 *
			 * ## Use
			 *
			 * When iterating over and array or list of items, you might need to render the index
			 * of the item. Use the `@index` directive to do so. For example,
			 *
			 * The template:
			 *
			 *     <ul>
			 *       {{#each items}}
			 *         <li> {{@index}} - {{.}} </li>
			 *       {{/each}}
			 *     </ul>
			 *
			 * Rendered with:
			 *
			 *     { items: ['Josh', 'Eli', 'David'] }
			 *
			 * Renders:
			 *
			 *     <ul>
			 *       <li> 0 - Josh </li>
			 *       <li> 1 - Eli </li>
			 *       <li> 2 - David </li>
			 *     </ul>
			 *
			 */
			"@index": function(offset, options) {
				if (!options) {
					options = offset;
					offset = 0;
				}
				var index = options.scope.attr("@index");
				return ""+((can.isFunction(index) ? index() : index) + offset);
			}
			/**
			 * @function can.mustache.helpers.key {{@key}}
			 *
			 * @parent can.mustache.htags 11
			 *
			 * @signature `{{@key}}`
			 *
			 * Insert the property name of an Object or attribute name of a can.Map that we iterate over with [#each](can.mustache.helpers.each)
			 *
			 * @body
			 *
			 * ## Use
			 *
			 * Use `{{@key}}` to render the property or attribute name of an Object or can.Map, when iterating over it with [#each](can.mustache.helpers.each). For example,
			 *
			 * The template:
			 *
			 *     <ul>
			 *       {{#each person}}
			 *         <li> {{@key}}: {{.}} </li>
			 *       {{/each}}
			 *     </ul>
			 *
			 * Rendered with:
			 *
			 *     { person: {name: 'Josh', age: 27, likes: 'Mustache, JavaScript, High Fives'} }
			 *
			 * Renders:
			 *
			 *     <ul>
			 *       <li> name: Josh </li>
			 *       <li> age: 27 </li>
			 *       <li> likes: Mustache, JavaScript, High Fives </li>
			 *     </ul>
			 *
			 */
		}, function (fn, name) {
			Mustache.registerHelper(name, fn);
		});

		// ## Registration
		//
		// Registers Mustache with can.view.
		can.view.register({
			suffix: "mustache",

			contentType: "x-mustache-template",

			// Returns a `function` that renders the view.
			script: function (id, src) {
				return "can.Mustache(function(" + ARG_NAMES + ") { " + new Mustache({
					text: src,
					name: id
				})
					.template.out + " })";
			},

			renderer: function (id, text) {
				return Mustache({
					text: text,
					name: id
				});
			}
		});
		
		can.mustache.registerHelper = can.proxy(can.Mustache.registerHelper, can.Mustache);
		can.mustache.safeString = can.Mustache.safeString;
		return can;
	});

