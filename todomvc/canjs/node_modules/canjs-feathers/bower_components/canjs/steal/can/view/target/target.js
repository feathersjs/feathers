/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/target/target*/
/* jshint maxdepth:7*/
steal("can/util", "can/view/elements.js",function(can, elements){
	
	var processNodes = function(nodes, paths, location){
		var frag = document.createDocumentFragment();
		
		for(var i = 0, len = nodes.length; i < len; i++) {
			var node = nodes[i];
			frag.appendChild( processNode(node,paths,location.concat(i)) );
		}
		return frag;
	},
		keepsTextNodes =  typeof document !== "undefined" && (function(){
			var testFrag = document.createDocumentFragment();
			var div = document.createElement("div");
			
			div.appendChild(document.createTextNode(""));
			div.appendChild(document.createTextNode(""));
			testFrag.appendChild(div);
			
			var cloned  = testFrag.cloneNode(true);
			
			return cloned.childNodes[0].childNodes.length === 2;
		})(),
		clonesWork = typeof document !== "undefined" && (function(){
			// Since html5shiv is required to support custom elements, assume cloning
			// works in any browser that doesn't have html5shiv

			// Clone an element containing a custom tag to see if the innerHTML is what we
			// expect it to be, or if not it probably was created outside of the document's
			// namespace.
			var a = document.createElement('a');
			a.innerHTML = "<xyz></xyz>";
			var clone = a.cloneNode(true);

			return clone.innerHTML === "<xyz></xyz>";
		})(),
		namespacesWork = typeof document !== "undefined" && !!document.createElementNS;

	/**
	 * @function cloneNode
	 * @hide
	 *
	 * A custom cloneNode function to be used in browsers that properly support cloning
	 * of custom tags (IE8 for example). Fixes it by doing some manual cloning that
	 * uses innerHTML instead, which has been shimmed.
	 *
	 * @param {DocumentFragment} frag A document fragment to clone
	 * @return {DocumentFragment} a new fragment that is a clone of the provided argument
	 */
	var cloneNode = clonesWork ?
		function(el){
			return el.cloneNode(true);
		} :
		function(node){
			var copy;

			if(node.nodeType === 1) {
				copy = document.createElement(node.nodeName);
			} else if(node.nodeType === 3){
				copy = document.createTextNode(node.nodeValue);
			} else if(node.nodeType === 8) {
				copy = document.createComment(node.nodeValue);
			} else if(node.nodeType === 11) {
				copy = document.createDocumentFragment();
			}

			if(node.attributes) {
				var attributes = can.makeArray(node.attributes);
				can.each(attributes, function (node) {
					if(node && node.specified) {
						copy.setAttribute(node.nodeName, node.nodeValue);
					}
				});
			}
			
			if(node.childNodes) {
				can.each(node.childNodes, function(child){
					copy.appendChild( cloneNode(child) );
				});
			}
			
			return copy;
		};

	function processNode(node, paths, location){
		var callback,
			loc = location,
			nodeType = typeof node,
			el,
			p,
			i , len;
		var getCallback = function(){
			if(!callback) {
				callback  = {
					path: location,
					callbacks: []
				};
				paths.push(callback);
				loc = [];
			}
			return callback;
		};
		
		if(nodeType === "object") {
			if( node.tag ) {
				if(namespacesWork && node.namespace) {
					el = document.createElementNS(node.namespace, node.tag);
				} else {
					el = document.createElement(node.tag);
				}
				
				if(node.attrs) {
					for(var attrName in node.attrs) {
						var value = node.attrs[attrName];
						if(typeof value === "function"){
							getCallback().callbacks.push({
								callback:  value
							});
						} else  {
							el.setAttribute(attrName, value);
						}
					}
				}
				if(node.attributes) {
					for(i = 0, len = node.attributes.length; i < len; i++ ) {
						getCallback().callbacks.push({callback: node.attributes[i]});
					}
				}
				if(node.children && node.children.length) {
					// add paths
					if(callback) {
						p = callback.paths = [];
					} else {
						p = paths;
					}
					el.appendChild( processNodes(node.children, p, loc) );
				}
			} else if(node.comment) {
				el = document.createComment(node.comment);
				
				if(node.callbacks) {
					for(i = 0, len = node.attributes.length; i < len; i++ ) {
						getCallback().callbacks.push({callback: node.callbacks[i]});
					}
				}
			}
			
			
		} else if(nodeType === "string"){
			el = document.createTextNode(node);
		} else if(nodeType === "function") {
			
			if(keepsTextNodes) {
				el = document.createTextNode("");
				getCallback().callbacks.push({callback: node});
			} else {
				el = document.createComment("~");
				getCallback().callbacks.push({callback: function(){
					var el = document.createTextNode("");
					elements.replace([this], el);
					return node.apply(el,arguments );
				}});
			}
			
		}
		return el;
	}
	
	function hydratePath(el, pathData, args){
		var path = pathData.path,
			callbacks = pathData.callbacks,
			paths = pathData.paths,
			callbackData,
			child = el;
		
		for(var i = 0, len = path.length; i < len; i++) {
			child = child.childNodes[path[i]];
		}
		
		for(i = 0, len = callbacks.length; i < len; i++) {
			callbackData = callbacks[i];
			callbackData.callback.apply(child, args );
		}
		if(paths && paths.length){
			for( i= paths.length - 1 ; i >= 0; i--) {
				hydratePath(child,paths[i], args);
			}
		}
	}

	function makeTarget(nodes){
		var paths = [];
		var frag = processNodes(nodes, paths, []);
		return {
			paths: paths,
			clone: frag,
			hydrate: function(){
				var cloned = cloneNode(this.clone);
				var args = can.makeArray(arguments);
				for(var i = paths.length - 1; i >=0 ; i--) {
					hydratePath(cloned,paths[i], args);
				}
				return cloned;
			}
		};
	}
	makeTarget.keepsTextNodes = keepsTextNodes;
	
	can.view.target = makeTarget;

	return makeTarget;
});

