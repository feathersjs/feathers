/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#util/fragment*/
steal('can/util/can.js', function (can) {
	// fragment.js
	// ---------
	// _DOM Fragment support._
	var fragmentRE = /^\s*<(\w+)[^>]*>/,
		toString = {}.toString,
		fragment = function (html, name) {
			if (name === undefined) {
				name = fragmentRE.test(html) && RegExp.$1;
			}
			if (html && toString.call(html.replace) === "[object Function]") {
				// Fix "XHTML"-style tags in all browsers
				html = html.replace(/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, '<$1></$2>');
			}
			var container = document.createElement('div'),
				temp = document.createElement('div');
			// IE's parser will strip any `<tr><td>` tags when `innerHTML`
			// is called on a `tbody`. To get around this, we construct a
			// valid table with a `tbody` that has the `innerHTML` we want.
			// Then the container is the `firstChild` of the `tbody`.
			// [source](http://www.ericvasilik.com/2006/07/code-karma.html).
			if (name === 'tbody' || name === 'tfoot' || name === 'thead') {
				temp.innerHTML = '<table>' + html + '</table>';
				container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild;
			} else if (name === 'tr') {
				temp.innerHTML = '<table><tbody>' + html + '</tbody></table>';
				container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild.firstChild;
			} else if (name === 'td' || name === 'th') {
				temp.innerHTML = '<table><tbody><tr>' + html + '</tr></tbody></table>';
				container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild.firstChild.firstChild;
			} else if (name === 'option') {
				temp.innerHTML = '<select>' + html + '</select>';
				container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild;
			} else {
				container.innerHTML = '' + html;
			}
			// IE8 barfs if you pass slice a `childNodes` object, so make a copy.
			var tmp = {}, children = container.childNodes;
			tmp.length = children.length;
			for (var i = 0; i < children.length; i++) {
				tmp[i] = children[i];
			}
			return [].slice.call(tmp);
		};
	can.buildFragment = function (html, nodes) {
		if(html && html.nodeType === 11) {
			return html;
		}
		var parts = fragment(html),
			frag = document.createDocumentFragment();
		for(var i = 0, length = parts.length; i < length; i++) {
			frag.appendChild(parts[i]);
		}
		return frag;
	};

	// ## Fix build fragment.
	// In IE8, we can pass a fragment and it removes newlines.
	// This checks for that and replaces can.buildFragment with something
	// that if only a single text node is returned, returns a fragment with
	// a text node that is set to the content.
	(function(){
		var text = "<-\n>",
			frag = can.buildFragment(text, document);
		if(text !== frag.childNodes[0].nodeValue) {
			var oldBuildFragment = can.buildFragment;
			can.buildFragment = function(html, nodes){
				var res = oldBuildFragment(html, nodes);
				if(res.childNodes.length === 1 && res.childNodes[0].nodeType === 3) {
					res.childNodes[0].nodeValue = html;
				}
				return res;
			};

		}
	})();

	return can;
});

