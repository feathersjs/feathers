/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#util/attr/attr*/
// # can/util/attr.js
// Central location for attribute changing to occur, used to trigger an
// `attributes` event on elements. This enables the user to do (jQuery example): `$(el).bind("attributes", function(ev) { ... })` where `ev` contains `attributeName` and `oldValue`.


steal("can/util/can.js", function (can) {

	// Acts as a polyfill for setImmediate which only works in IE 10+. Needed to make
	// the triggering of `attributes` event async.
	var setImmediate = can.global.setImmediate || function (cb) {
				return setTimeout(cb, 0);
			},
		attr = {
			// This property lets us know if the browser supports mutation observers.
			// If they are supported then that will be setup in can/util/jquery and those native events will be used to inform observers of attribute changes.
			// Otherwise this module handles triggering an `attributes` event on the element.
			MutationObserver: can.global.MutationObserver || can.global.WebKitMutationObserver || can.global.MozMutationObserver,

			/**
			 * @property {Object.<String,(String|Boolean|function)>} can.view.attr.map
			 * @parent can.view.elements
			 * @hide
			 *
			 *
			 * A mapping of
			 * special attributes to their JS property. For example:
			 *
			 *     "class" : "className"
			 *
			 * means get or set `element.className`. And:
			 *
			 *      "checked" : true
			 *
			 * means set `element.checked = true`.
			 *
			 *
			 * If the attribute name is not found, it's assumed to use
			 * `element.getAttribute` and `element.setAttribute`.
			 */
			map: {
				"class": "className",
				"value": "value",
				"innertext": "innerText",
				"textcontent": "textContent",
				"checked": true,
				"disabled": true,
				"readonly": true,
				"required": true,
				// For the `src` attribute we are using a setter function to prevent values such as an empty string or null from being set.
				// An `img` tag attempts to fetch the `src` when it is set, so we need to prevent that from happening by removing the attribute instead.
				src: function (el, val) {
					if (val == null || val === "") {
						el.removeAttribute("src");
						return null;
					} else {
						el.setAttribute("src", val);
						return val;
					}
				},
				style: function (el, val) {
					return el.style.cssText = val || "";
				}
			},
			// These are elements whos default value we should set.
			defaultValue: ["input", "textarea"],
			// ## attr.set
			// Set the value an attribute on an element.
			set: function (el, attrName, val) {
				attrName = attrName.toLowerCase();
				var oldValue;
				// In order to later trigger an event we need to compare the new value to the old value, so here we go ahead and retrieve the old value for browsers that don't have native MutationObservers.
				if (!attr.MutationObserver) {
					oldValue = attr.get(el, attrName);
				}

				var tagName = el.nodeName.toString().toLowerCase(),
					prop = attr.map[attrName],
					newValue;

				// Using the property of `attr.map`, go through and check if the property is a function, and if so call it. Then check if the property is `true`, and if so set the value to `true`, also making sure to set `defaultChecked` to `true` for elements of `attr.defaultValue`. We always set the value to true because for these boolean properties, setting them to false would be the same as removing the attribute.
				//
				// For all other attributes use `setAttribute` to set the new value.
				if (typeof prop === "function") {
					newValue = prop(el, val);
				} else if (prop === true) {
					newValue = el[attrName] = true;

					if (attrName === "checked" && el.type === "radio") {
						if (can.inArray(tagName, attr.defaultValue) >= 0) {
							el.defaultChecked = true;
						}
					}

				} else if (prop) {
					newValue = val;
					if (el[prop] !== val) {
						el[prop] = val;
					}
					if (prop === "value" && can.inArray(tagName, attr.defaultValue) >= 0) {
						el.defaultValue = val;
					}
				} else {
					el.setAttribute(attrName, val);
					newValue = val;
				}

				// Now that the value has been set, for browsers without MutationObservers, check to see that value has changed and if so trigger the "attributes" event on the element.
				if (!attr.MutationObserver && newValue !== oldValue) {
					attr.trigger(el, attrName, oldValue);
				}
			},
			// ## attr.trigger
			// Used to trigger an "attributes" event on an element. Checks to make sure that someone is listening for the event and then queues a function to be called asynchronously using `setImmediate.
			trigger: function (el, attrName, oldValue) {
				if (can.data(can.$(el), "canHasAttributesBindings")) {
					attrName = attrName.toLowerCase();
					return setImmediate(function () {
						can.trigger(el, {
							type: "attributes",
							attributeName: attrName,
							target: el,
							oldValue: oldValue,
							bubbles: false
						}, []);
					});
				}
			},
			// ## attr.get
			// Gets the value of an attribute. First checks to see if the property is a string on `attr.map` and if so returns the value from the element's property. Otherwise uses `getAttribute` to retrieve the value.
			get: function (el, attrName) {
				attrName = attrName.toLowerCase();
				var prop = attr.map[attrName];
				if(typeof prop === "string" && el[prop]) {
					return el[prop];
				}

				return el.getAttribute(attrName);
			},
			// ## attr.remove
			// Removes an attribute from an element. Works by using the `attr.map` to see if the attribute is a special type of property. If the property is a function then the fuction is called with `undefined` as the value. If the property is `true` then the attribute is set to false. If the property is a string then the attribute is set to an empty string. Otherwise `removeAttribute` is used.
			//
			// If the attribute previously had a value and the browser doesn't support MutationObservers we then trigger an "attributes" event.
			remove: function (el, attrName) {
				attrName = attrName.toLowerCase();
				var oldValue;
				if (!attr.MutationObserver) {
					oldValue = attr.get(el, attrName);
				}

				var setter = attr.map[attrName];
				if (typeof setter === "function") {
					setter(el, undefined);
				}
				if (setter === true) {
					el[attrName] = false;
				} else if (typeof setter === "string") {
					el[setter] = "";
				} else {
					el.removeAttribute(attrName);
				}
				if (!attr.MutationObserver && oldValue != null) {
					attr.trigger(el, attrName, oldValue);
				}

			},
			// ## attr.has
			// Checks if an element contains an attribute.
			// For browsers that support `hasAttribute`, creates a function that calls hasAttribute, otherwise creates a function that uses `getAttribute` to check that the attribute is not null.
			has: (function () {
				var el = can.global.document && document.createElement('div');
				if (el && el.hasAttribute) {
					return function (el, name) {
						return el.hasAttribute(name);
					};
				} else {
					return function (el, name) {
						return el.getAttribute(name) !== null;
					};
				}
			})()
		};

	return attr;

});

