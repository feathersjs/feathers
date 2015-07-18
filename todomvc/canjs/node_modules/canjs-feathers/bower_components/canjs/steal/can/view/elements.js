/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/elements*/
steal('can/util', "can/view",function (can) {

	var doc = typeof document !== "undefined" ? document: null;

	var selectsCommentNodes = doc && (function(){
		return can.$(document.createComment('~')).length === 1;
	})();

	/**
	 * @property {Object} can.view.elements
	 * @parent can.view
	 *
	 * Provides helper methods for and information about the behavior
	 * of DOM elements.
	 */
	var elements = {
		tagToContentPropMap: {
			option: ( doc && "textContent" in document.createElement("option") ) ? "textContent" : "innerText",
			textarea: 'value'
		},
		/**
		 * @property {Object.<String,(String|Boolean|function)>} can.view.elements.attrMap
		 * @parent can.view.elements
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
		// 3.0 TODO: remove
		attrMap: can.attr.map,
		// matches the attrName of a regexp
		attrReg: /([^\s=]+)[\s]*=[\s]*/,
		// 3.0 TODO: remove
		defaultValue: can.attr.defaultValue,
		// a map of parent element to child elements
		/**
		 * @property {Object.<String,String>} can.view.elements.tagMap
		 * @parent can.view.elements
		 *
		 * A mapping of parent node names to child node names that can be inserted within
		 * the parent node name.  For example: `table: "tbody"` means that
		 * if you want a placeholder element within a `table`, a `tbody` will be
		 * created.
		 */
		tagMap: {
			'': 'span',
			colgroup: 'col',
			table: 'tbody',
			tr: 'td',
			ol: 'li',
			ul: 'li',
			tbody: 'tr',
			thead: 'tr',
			tfoot: 'tr',
			select: 'option',
			optgroup: 'option'
		},
		// a tag's parent element
		reverseTagMap: {
			col: 'colgroup',
			tr: 'tbody',
			option: 'select',
			td: 'tr',
			th: 'tr',
			li: 'ul'
		},
		// Used to determine the parentNode if el is directly within a documentFragment
		getParentNode: function (el, defaultParentNode) {
			return defaultParentNode && el.parentNode.nodeType === 11 ? defaultParentNode : el.parentNode;
		},
		// 3.0 TODO: remove
		setAttr: can.attr.set,
		// 3.0 TODO: remove
		getAttr: can.attr.get,
		// 3.0 TODO: remove
		removeAttr: can.attr.remove,
		// Gets a "pretty" value for something
		contentText: function (text) {
			if (typeof text === 'string') {
				return text;
			}
			// If has no value, return an empty string.
			if (!text && text !== 0) {
				return '';
			}
			return '' + text;
		},
		/**
		 * @function can.view.elements.after
		 * @parent can.view.elements
		 *
		 * Inserts newFrag after oldElements.
		 *
		 * @param {Array.<HTMLElement>} oldElements
		 * @param {DocumentFragment} newFrag
		 */
		after: function (oldElements, newFrag) {
			var last = oldElements[oldElements.length - 1];
			// Insert it in the `document` or `documentFragment`
			if (last.nextSibling) {
				can.insertBefore(last.parentNode, newFrag, last.nextSibling);
			} else {
				can.appendChild(last.parentNode, newFrag);
			}
		},
		/**
		 * @function can.view.elements.replace
		 * @parent can.view.elements
		 *
		 * Replaces `oldElements` with `newFrag`
		 *
		 * @param {Array.<HTMLElement>} oldElements
		 * @param {DocumentFragment} newFrag
		 */
		replace: function (oldElements, newFrag) {
			elements.after(oldElements, newFrag);
			if(can.remove(can.$(oldElements)).length < oldElements.length && !selectsCommentNodes) {
				can.each(oldElements, function(el) {
					if(el.nodeType === 8) {
						el.parentNode.removeChild(el);
					}
				});
			}
		}
	};

	can.view.elements = elements;

	return elements;
});

