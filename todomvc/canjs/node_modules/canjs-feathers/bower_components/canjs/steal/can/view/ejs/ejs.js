/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/ejs/ejs*/
// # can/view/ejs/ejs.js
// 
// `can.EJS`: Embedded JavaScript Templates
// 
steal('can/util',
	'can/view',
	'can/util/string',
	'can/compute',
	'can/view/scanner.js',
	'can/view/render.js',
function (can) {
	// ## Helper methods
	var extend = can.extend,
		EJS = function (options) {
			// Supports calling EJS without the constructor.
			// This returns a function that renders the template.
			if (this.constructor !== EJS) {
				var ejs = new EJS(options);
				return function (data, helpers) {
					return ejs.render(data, helpers);
				};
			}
			// If we get a `function` directly, it probably is coming from
			// a `steal`-packaged view.
			if (typeof options === 'function') {
				this.template = {
					fn: options
				};
				return;
			}
			// Set options on self.
			extend(this, options);
			this.template = this.scanner.scan(this.text, this.name);
		};
	// Expose EJS via the `can` object.
	can.EJS = EJS;

	EJS.prototype.
	// ## Render
	// Render a view object with data and helpers.
	render = function (object, extraHelpers) {
		object = object || {};
		return this.template.fn.call(object, object, new EJS.Helpers(object, extraHelpers || {}));
	};
	extend(EJS.prototype, {
		// ## Scanner
		// Singleton scanner instance for parsing templates. See [scanner.js](scanner.html)
		// for more information.
		// 
		// ### Text
		// 
		// #### Definitions
		// 
		// * `outStart` - Wrapper start text for view function.
		// 
		// * `outEnd` - Wrapper end text for view function.
		// 
		// * `argNames` - Arguments passed into view function.
		scanner: new can.view.Scanner({
			text: {
				outStart: 'with(_VIEW) { with (_CONTEXT) {',
				outEnd: "}}",
				argNames: '_CONTEXT,_VIEW',
				context: "this"
			},
			// ### Tokens
			// 
			// An ordered token registry for the scanner. Scanner makes evaluations
			// based on which tags are considered opening/closing as well as escaped, etc.
			tokens: [
				["templateLeft", "<%%"],
				["templateRight", "%>"],
				["returnLeft", "<%=="],
				["escapeLeft", "<%="],
				["commentLeft", "<%#"],
				["left", "<%"],
				["right", "%>"],
				["returnRight", "%>"]
			],
			// ### Helpers
			helpers: [
				{
					// Regex to see if its a func like `()->`.
					name: /\s*\(([\$\w]+)\)\s*->([^\n]*)/,
					// Evaluate rocket syntax function with correct context.
					fn: function (content) {
						var quickFunc = /\s*\(([\$\w]+)\)\s*->([^\n]*)/,
							parts = content.match(quickFunc);

						return "can.proxy(function(__){var " + parts[1] + "=can.$(__);" + parts[2] + "}, this);";
					}
				}
			],
			// ### transform
			// Transforms the EJS template to add support for shared blocks.
			// Essentially, this breaks up EJS tags into multiple EJS tags
			// if they contained unmatched brackets.
			// 
			// For example, this doesn't work:
			// 
			// `<% if (1) { %><% if (1) { %> hi <% } } %>`
			// 
			// ...without isolated EJS blocks:
			// 
			// `<% if (1) { %><% if (1) { %> hi <% } %><% } %>`
			// 
			// The result of transforming:
			// 
			// `<% if (1) { %><% %><% if (1) { %><% %> hi <% } %><% } %>`
			transform: function (source) {
				return source.replace(/<%([\s\S]+?)%>/gm, function (whole, part) {
					var brackets = [],
						foundBracketPair, i;
					// Look for brackets (for removing self-contained blocks)
					part.replace(/[{}]/gm, function (bracket, offset) {
						brackets.push([
							bracket,
							offset
						]);
					});
					// Remove bracket pairs from the list of replacements
					do {
						foundBracketPair = false;
						for (i = brackets.length - 2; i >= 0; i--) {
							if (brackets[i][0] === '{' && brackets[i + 1][0] === '}') {
								brackets.splice(i, 2);
								foundBracketPair = true;
								break;
							}
						}
					} while (foundBracketPair);
					// Unmatched brackets found, inject EJS tags
					if (brackets.length >= 2) {
						var result = ['<%'],
							bracket, last = 0;
						for (i = 0; bracket = brackets[i]; i++) {
							result.push(part.substring(last, last = bracket[1]));
							if (bracket[0] === '{' && i < brackets.length - 1 || bracket[0] === '}' && i > 0) {
								result.push(bracket[0] === '{' ? '{ %><% ' : ' %><% }');
							} else {
								result.push(bracket[0]);
							}
							++last;
						}
						result.push(part.substring(last), '%>');
						return result.join('');
					}
					// Otherwise return the original
					else {
						return '<%' + part + '%>';
					}
				});
			}
		})
	});

	// ## Helpers
	// 
	// In your EJS view you can then call the helper on an element tag:
	// 
	// `<div <%= upperHtml('javascriptmvc') %>></div>`
	EJS.Helpers = function (data, extras) {
		this._data = data;
		this._extras = extras;
		extend(this, extras);
	};

	EJS.Helpers.prototype = {
		// List allows for live binding a can.List easily within a template.
		list: function (list, cb) {
			can.each(list, function (item, i) {
				cb(item, i, list);
			});
		},
		// `each` iterates through a enumerated source(such as can.List or array)
		// and sets up live binding when possible.
		each: function (list, cb) {
			// Normal arrays don't get live updated
			if (can.isArray(list)) {
				this.list(list, cb);
			} else {
				can.view.lists(list, cb);
			}
		}
	};
	// Registers options for a `steal` build.
	can.view.register({
		suffix: 'ejs',
		script: function (id, src) {
			return 'can.EJS(function(_CONTEXT,_VIEW) { ' + new EJS({
				text: src,
				name: id
			})
				.template.out + ' })';
		},
		renderer: function (id, text) {
			return EJS({
				text: text,
				name: id
			});
		}
	});
	can.ejs.Helpers = EJS.Helpers;
	
	
	return can;
});

