/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/live/live*/
steal('can/util', 'can/view/elements.js', 'can/view', 'can/view/node_lists', 'can/view/parser',function (can, elements, view, nodeLists, parser) {

	elements = elements || can.view.elements;
	nodeLists = nodeLists || can.view.NodeLists;
	parser = parser || can.view.parser;

	// ## live.js
	//
	// The live module provides live binding for computes
	// and can.List.
	//
	// Currently, it's API is designed for `can/view/render`, but
	// it could easily be used for other purposes.
	// ### Helper methods
	//
	// #### setup
	//
	// `setup(HTMLElement, bind(data), unbind(data)) -> data`
	//
	// Calls bind right away, but will call unbind
	// if the element is "destroyed" (removed from the DOM).
	var setup = function (el, bind, unbind) {
		// Removing an element can call teardown which
		// unregister the nodeList which calls teardown
		var tornDown = false,
			teardown = function () {
				if (!tornDown) {
					tornDown = true;
					unbind(data);
					can.unbind.call(el, 'removed', teardown);
				}
				return true;
			}, data = {
				teardownCheck: function (parent) {
					return parent ? false : teardown();
				}
			};
		can.bind.call(el, 'removed', teardown);
		bind(data);
		return data;
	},
		// #### listen
		// Calls setup, but presets bind and unbind to
		// operate on a compute
		listen = function (el, compute, change) {
			return setup(el, function () {
				compute.bind('change', change);
			}, function (data) {
				compute.unbind('change', change);
				if (data.nodeList) {
					nodeLists.unregister(data.nodeList);
				}
			});
		},
		// #### getAttributeParts
		// Breaks up a string like foo='bar' into ["foo","'bar'""]
		getAttributeParts = function (newVal) {
			var attrs = {},
				attr;
			parser.parseAttrs(newVal,{
				attrStart: function(name){
					attrs[name] = "";
					attr = name;
				},
				attrValue: function(value){
					attrs[attr] += value;
				},
				attrEnd: function(){}
			});
			return attrs;
		},
		splice = [].splice,
		isNode = function(obj){
			return obj && obj.nodeType;
		},
		addTextNodeIfNoChildren = function(frag){
			if(!frag.childNodes.length) {
				frag.appendChild(document.createTextNode(""));
			}
		};
	/**
	 * @property {Object} can.view.live
	 * @parent can.view.static
	 * @release 2.0.4
	 *
	 * Setup live-binding between the DOM and a compute manually.
	 * 
	 * @option {Object} An object with the live-binding methods:
	 * [can.view.live.html], [can.view.live.list], [can.view.live.text], 
	 * [can.view.live.attr] and [can.view.live.attrs].
	 * 
	 * @body
	 *
	 * ## Use
	 *
	 * `can.view.live` is an object with utlitiy methods for setting up
	 * live-binding in relation to different parts of the DOM and DOM elements.  For 
	 * example, to make an `<h2>`'s text stay live with
	 * a compute:
	 * 
	 *     var text = can.compute("Hello World");
	 *     var textNode = $("h2").text(" ")[0].childNodes[0];
	 *     can.view.live.text(textNode, text);
	 *
	 *
	 */
	var live = {
		/**
		 * @function can.view.live.list
		 * @parent can.view.live
		 * @release 2.0.4
		 *
		 * Live binds a compute's [can.List] incrementally.
		 *
		 *
		 * @param {HTMLElement} el An html element to replace with the live-section.
		 *
		 * @param {can.compute|can.List} list A [can.List] or [can.compute] whose value is a [can.List].
		 *
		 * @param {function(this:*,*,index):String} render(index, index) A function that when called with
		 * the incremental item to render and the index of the item in the list.
		 *
		 * @param {Object} context The `this` the `render` function will be called with.
		 *
		 * @param {HTMLElement} [parentNode] An overwritable parentNode if `el`'s parent is
		 * a documentFragment.
		 *
		 * ## Use
		 *
		 * `can.view.live.list` is used to setup incremental live-binding.
		 *
		 *     // a compute that change's it's list
		 *     var todos = can.compute(function(){
		 *       return new Todo.List({page: can.route.attr("page")})
		 *     })
		 *
		 *     var placeholder = document.createTextNode(" ")
		 *     $("ul#todos").append(placeholder)
		 *
		 *
		 *
		 *     can.view.live.list(
		 *       placeholder,
		 *       todos,
		 *       function(todo, index){
		 *         return "<li>"+todo.attr("name")+"</li>"
		 *       })
		 *
		 */
		list: function (el, compute, render, context, parentNode, nodeList) {
			// A nodeList of all elements this live-list manages.
			// This is here so that if this live list is within another section
			// that section is able to remove the items in this list.
			var masterNodeList = nodeList || [el],
				// A mapping of items to their indicies'
				indexMap = [],
				// True once all previous events have been fired
				afterPreviousEvents = false,
				// Indicates that we should not be responding to changes in the list.
				// It's possible that the compute change causes this list behavior to be torn down.
				// However that same "change" dispatch will eventually fire the updateList handler because
				// the list of "change" handlers is copied when dispatching starts.
				// A 'perfect' fix would be to use linked lists for event handlers.
				isTornDown = false,
				// Called when items are added to the list.
				add = function (ev, items, index) {
					if (!afterPreviousEvents) {
						return;
					}
					// Collect new html and mappings
					var frag = document.createDocumentFragment(),
						newNodeLists = [],
						newIndicies = [];
					// For each new item,
					can.each(items, function (item, key) {
						var itemNodeList = [];

						if(nodeList) {
							nodeLists.register(itemNodeList,null, true);
						}
						
						var itemIndex = can.compute(key + index),
							// get its string content
							itemHTML = render.call(context, item, itemIndex, itemNodeList),
							gotText = typeof itemHTML === "string",
							// and convert it into elements.
							itemFrag = can.frag(itemHTML);
						// Add those elements to the mappings.
						
						itemFrag = gotText ? can.view.hookup(itemFrag) : itemFrag;
						
						var childNodes = can.makeArray(itemFrag.childNodes);
						if(nodeList) {
							nodeLists.update(itemNodeList, childNodes);
							newNodeLists.push(itemNodeList);
						} else {
							newNodeLists.push(nodeLists.register(childNodes));
						}
						
						
						// Hookup the fragment (which sets up child live-bindings) and
						// add it to the collection of all added elements.
						frag.appendChild(itemFrag);
						// track indicies;
						newIndicies.push(itemIndex);
					});
					// The position of elements is always after the initial text placeholder node
					var masterListIndex = index+1;
					
					
					// Check if we are adding items at the end
					if (!masterNodeList[masterListIndex]) {
						elements.after(masterListIndex === 1 ? [text] : [nodeLists.last(masterNodeList[masterListIndex - 1])], frag);
					} else {
						// Add elements before the next index's first element.
						var el = nodeLists.first(masterNodeList[masterListIndex]);
						can.insertBefore(el.parentNode, frag, el);
					}
					splice.apply(masterNodeList, [
						masterListIndex,
						0
					].concat(newNodeLists));
					
					// update indices after insert point
					splice.apply(indexMap, [
						index,
						0
					].concat(newIndicies));
					
					for (var i = index + newIndicies.length, len = indexMap.length; i < len; i++) {
						indexMap[i](i);
					}
				},
				// Called when items are removed or when the bindings are torn down.
				remove = function (ev, items, index, duringTeardown, fullTeardown) {
					if (!afterPreviousEvents) {
						return;
					}
					// If this is because an element was removed, we should
					// check to make sure the live elements are still in the page.
					// If we did this during a teardown, it would cause an infinite loop.
					if (!duringTeardown && data.teardownCheck(text.parentNode)) {
						return;
					}
					if(index < 0) {
						index = indexMap.length + index;
					}

					var removedMappings = masterNodeList.splice(index + 1, items.length),
						itemsToRemove = [];
					can.each(removedMappings, function (nodeList) {
						
						// Unregister to free up event bindings.
						var nodesToRemove = nodeLists.unregister(nodeList);
						
						// add items that we will remove all at once
						[].push.apply(itemsToRemove, nodesToRemove);
					});
					// update indices after remove point
					indexMap.splice(index, items.length);
					for (var i = index, len = indexMap.length; i < len; i++) {
						indexMap[i](i);
					}
					// don't remove elements during teardown.  Something else will probably be doing that.
					if(!fullTeardown) {
						can.remove(can.$(itemsToRemove));
					} else {
						nodeLists.unregister(masterNodeList);
					}

				},
				move = function (ev, item, newIndex, currentIndex) {
					if (!afterPreviousEvents) {
						return;
					}
					// The position of elements is always after the initial text
					// placeholder node
					newIndex = newIndex + 1;
					currentIndex = currentIndex + 1;

					var referenceNodeList = masterNodeList[newIndex];
					var movedElements = can.frag( nodeLists.flatten(masterNodeList[currentIndex]) );
					var referenceElement;
					
					// If we're moving forward in the list, we want to be placed before
					// the item AFTER the target index since removing the item from
					// the currentIndex drops the referenceItem's index. If there is no
					// nextSibling, insertBefore acts like appendChild.
					if (currentIndex < newIndex) {
						referenceElement = nodeLists.last(referenceNodeList).nextSibling;
					} else {
						referenceElement = nodeLists.first(referenceNodeList);
					}
					
					var parentNode = masterNodeList[0].parentNode;


					// Move the DOM nodes into the proper location
					parentNode.insertBefore(movedElements, referenceElement);

					// Now, do the same for the masterNodeList. We need to keep it
					// in sync with the DOM.

					// Save a reference to the "node" in that we're manually moving
					var temp = masterNodeList[currentIndex];

					// Remove the movedItem from the masterNodeList
					[].splice.apply(masterNodeList, [currentIndex, 1]);

					// Move the movedItem to the correct index in the masterNodeList
					[].splice.apply(masterNodeList, [newIndex, 0, temp]);
				},
				// A text node placeholder
				text = document.createTextNode(''),
				// The current list.
				list,
				// Called when the list is replaced with a new list or the binding is torn-down.
				teardownList = function (fullTeardown) {
					// there might be no list right away, and the list might be a plain
					// array
					if (list && list.unbind) {
						list.unbind('add', add)
							.unbind('remove', remove)
							.unbind('move', move);
					}
					// use remove to clean stuff up for us
					remove({}, {
						length: masterNodeList.length - 1
					}, 0, true, fullTeardown);
				},
				// Called when the list is replaced or setup.
				updateList = function (ev, newList, oldList) {
					if(isTornDown) {
						return;
					}
					teardownList();
					// make an empty list if the compute returns null or undefined
					list = newList || [];
					
					// list might be a plain array
					if (list.bind) {
						list.bind('add', add)
							.bind('remove', remove)
							.bind('move', move);
					}
					// temporarily allow add method.
					afterPreviousEvents = true;
					add({}, list, 0);
					afterPreviousEvents = false;
					
					can.batch.afterPreviousEvents(function(){
						afterPreviousEvents = true;
					});
				};
			parentNode = elements.getParentNode(el, parentNode);
			// Setup binding and teardown to add and remove events
			var data = setup(parentNode, function () {
				// TODO: for stache, binding on the compute is not necessary.
				if (can.isFunction(compute)) {
					compute.bind('change', updateList);
				}
			}, function () {
				if (can.isFunction(compute)) {
					compute.unbind('change', updateList);
				}
				teardownList(true);
			});
			
			if(!nodeList) {
				live.replace(masterNodeList, text, data.teardownCheck);
			} else {
				elements.replace(masterNodeList, text);
				nodeLists.update(masterNodeList, [text]);
				nodeList.unregistered = function(){
					data.teardownCheck();
					isTornDown = true;
				};
			}
			
			// run the list setup
			updateList({}, can.isFunction(compute) ? compute() : compute);
		},
		/**
		 * @function can.view.live.html
		 * @parent can.view.live
		 * @release 2.0.4
		 *
		 * Live binds a compute's value to a collection of elements.
		 *
		 *
		 * @param {HTMLElement} el An html element to replace with the live-section.
		 *
		 * @param {can.compute} compute A [can.compute] whose value is HTML.
		 *
		 * @param {HTMLElement} [parentNode] An overwritable parentNode if `el`'s parent is
		 * a documentFragment.
		 *
		 * ## Use
		 *
		 * `can.view.live.html` is used to setup incremental live-binding.
		 *
		 *     // a compute that change's it's list
		 *     var greeting = can.compute(function(){
		 *       return "Welcome <i>"+me.attr("name")+"</i>"
		 *     });
		 *
		 *     var placeholder = document.createTextNode(" ");
		 *     $("#greeting").append(placeholder);
		 *
		 *     can.view.live.html( placeholder,  greeting );
		 *
		 */
		html: function (el, compute, parentNode, nodeList) {
			var data;
			parentNode = elements.getParentNode(el, parentNode);
			data = listen(parentNode, compute, function (ev, newVal, oldVal) {
				
				// TODO: remove teardownCheck in 2.1
				var attached = nodeLists.first(nodes).parentNode;
				// update the nodes in the DOM with the new rendered value
				if (attached) {
					makeAndPut(newVal);
				}
				data.teardownCheck(nodeLists.first(nodes).parentNode);
			});

			var nodes = nodeList || [el],
				makeAndPut = function (val) {
					var isFunction = typeof val === "function",
						aNode = isNode(val),
						frag = can.frag(isFunction ? "" : val),
						oldNodes = can.makeArray(nodes);
					
					// Add a placeholder textNode if necessary.
					addTextNodeIfNoChildren(frag);
					
					if(!aNode && !isFunction){
						frag = can.view.hookup(frag, parentNode);
					}
					
					// We need to mark each node as belonging to the node list.
					oldNodes = nodeLists.update(nodes, frag.childNodes);
					if(isFunction) {
						val(frag.childNodes[0]);
					}
					elements.replace(oldNodes, frag);
					
				};
				
			data.nodeList = nodes;
			
			// register the span so nodeLists knows the parentNodeList
			if(!nodeList) {
				nodeLists.register(nodes, data.teardownCheck);
			} else {
				nodeList.unregistered = data.teardownCheck;
			}
			makeAndPut(compute());
		},
		/**
		 * @function can.view.live.replace
		 * @parent can.view.live
		 * @release 2.0.4
		 *
		 * Replaces one element with some content while keeping [can.view.live.nodeLists nodeLists] data
		 * correct.
		 *
		 * @param {Array.<HTMLElement>} nodes An array of elements.  There should typically be one element.
		 * @param {String|HTMLElement|DocumentFragment} val The content that should replace
		 * `nodes`.  If a string is passed, it will be [can.view.hookup hookedup].
		 *
		 * @param {function} [teardown] A callback if these elements are torn down.
		 */
		replace: function (nodes, val, teardown) {
			var oldNodes = nodes.slice(0),
				frag = can.frag(val);
			nodeLists.register(nodes, teardown);
			
			
			if (typeof val === 'string') {
				// if it was a string, check for hookups
				frag = can.view.hookup(frag, nodes[0].parentNode);
			}
			// We need to mark each node as belonging to the node list.
			nodeLists.update(nodes, frag.childNodes);
			elements.replace(oldNodes, frag);
			return nodes;
		},
		/**
		 * @function can.view.live.text
		 * @parent can.view.live
		 * @release 2.0.4
		 *
		 * Replaces one element with some content while keeping [can.view.live.nodeLists nodeLists] data
		 * correct.
		 */
		text: function (el, compute, parentNode, nodeList) {
			var parent = elements.getParentNode(el, parentNode);
			// setup listening right away so we don't have to re-calculate value
			var data = listen(parent, compute, function (ev, newVal, oldVal) {
				// Sometimes this is 'unknown' in IE and will throw an exception if it is
				/* jshint ignore:start */
				if (typeof node.nodeValue !== 'unknown') {
					node.nodeValue = can.view.toStr(newVal);
				}
				/* jshint ignore:end */
				// TODO: remove in 2.1
				data.teardownCheck(node.parentNode);
			});
			// The text node that will be updated
				
			var node = document.createTextNode(can.view.toStr(compute()));
			if(nodeList) {
				nodeList.unregistered = data.teardownCheck;
				data.nodeList = nodeList;
				
				nodeLists.update(nodeList, [node]);
				elements.replace([el], node);
			} else {
				// Replace the placeholder with the live node and do the nodeLists thing.
				// Add that node to nodeList so we can remove it when the parent element is removed from the page
				data.nodeList = live.replace([el], node, data.teardownCheck);
			}
			
		},
		setAttributes: function(el, newVal) {
			var attrs = getAttributeParts(newVal);
			for(var name in attrs) {
				can.attr.set(el, name, attrs[name]);
			}
		},
		/**
		 * @function can.view.live.attrs
		 * @parent can.view.live
		 * 
		 * Keep attributes live to a [can.compute].
		 * 
		 * @param {HTMLElement} el The element whos attributes will be kept live.
		 * @param {can.compute} compute The compute.
		 * 
		 * @body
		 * 
		 * ## Use
		 * 
		 *     var div = document.createElement('div');
		 *     var compute = can.compute("foo='bar' zed='ted'");
		 *     can.view.live.attr(div,compute);
		 * 
		 */
		attributes: function (el, compute, currentValue) {
			var oldAttrs = {};
			
			var setAttrs = function (newVal) {
				var newAttrs = getAttributeParts(newVal),
					name;
				for( name in newAttrs ) {
					var newValue = newAttrs[name],
						oldValue = oldAttrs[name];
					if(newValue !== oldValue) {
						can.attr.set(el, name, newValue);
					}
					delete oldAttrs[name];
				}
				for( name in oldAttrs ) {
					elements.removeAttr(el, name);
				}
				oldAttrs = newAttrs;
			};
			listen(el, compute, function (ev, newVal) {
				setAttrs(newVal);
			});
			// current value has been set
			if (arguments.length >= 3) {
				oldAttrs = getAttributeParts(currentValue);
			} else {
				setAttrs(compute());
			}
		},
		attributePlaceholder: '__!!__',
		attributeReplace: /__!!__/g,
		attribute: function (el, attributeName, compute) {
			listen(el, compute, function (ev, newVal) {
				elements.setAttr(el, attributeName, hook.render());
			});
			var wrapped = can.$(el),
				hooks;
			// Get the list of hookups or create one for this element.
			// Hooks is a map of attribute names to hookup `data`s.
			// Each hookup data has:
			// `render` - A `function` to render the value of the attribute.
			// `funcs` - A list of hookup `function`s on that attribute.
			// `batchNum` - The last event `batchNum`, used for performance.
			hooks = can.data(wrapped, 'hooks');
			if (!hooks) {
				can.data(wrapped, 'hooks', hooks = {});
			}
			// Get the attribute value.
			var attr = elements.getAttr(el, attributeName),
				// Split the attribute value by the template.
				// Only split out the first __!!__ so if we have multiple hookups in the same attribute,
				// they will be put in the right spot on first render
				parts = attr.split(live.attributePlaceholder),
				goodParts = [],
				hook;
			goodParts.push(parts.shift(), parts.join(live.attributePlaceholder));
			// If we already had a hookup for this attribute...
			if (hooks[attributeName]) {
				// Just add to that attribute's list of `function`s.
				hooks[attributeName].computes.push(compute);
			} else {
				// Create the hookup data.
				hooks[attributeName] = {
					render: function () {
						var i = 0,
							// attr doesn't have a value in IE
							newAttr = attr ? attr.replace(live.attributeReplace, function () {
								return elements.contentText(hook.computes[i++]());
							}) : elements.contentText(hook.computes[i++]());
						return newAttr;
					},
					computes: [compute],
					batchNum: undefined
				};
			}
			// Save the hook for slightly faster performance.
			hook = hooks[attributeName];
			// Insert the value in parts.
			goodParts.splice(1, 0, compute());

			// Set the attribute.
			elements.setAttr(el, attributeName, goodParts.join(''));
		},
		specialAttribute: function (el, attributeName, compute) {
			listen(el, compute, function (ev, newVal) {
				elements.setAttr(el, attributeName, getValue(newVal));
			});
			elements.setAttr(el, attributeName, getValue(compute()));
		},
		/**
		 * @function can.view.live.attr
		 * @parent can.view.live
		 * 
		 * Keep an attribute live to a [can.compute].
		 * 
		 * @param {HTMLElement} el The element whos attribute will be kept live.
		 * @param {String} attributeName The attribute name.
		 * @param {can.compute} compute The compute.
		 * 
		 * @body
		 * 
		 * ## Use
		 * 
		 *     var div = document.createElement('div');
		 *     var compute = can.compute("foo bar");
		 *     can.view.live.attr(div,"class", compute);
		 */
		simpleAttribute: function(el, attributeName, compute){
			listen(el, compute, function (ev, newVal) {
				elements.setAttr(el, attributeName, newVal);
			});
			elements.setAttr(el, attributeName, compute());
		}
	};
	live.attr = live.simpleAttribute;
	live.attrs = live.attributes;
	var newLine = /(\r|\n)+/g;
	var getValue = function (val) {
		var regexp = /^["'].*["']$/;
		val = val.replace(elements.attrReg, '')
			.replace(newLine, '');
		// check if starts and ends with " or '
		return regexp.test(val) ? val.substr(1, val.length - 2) : val;
	};
	can.view.live = live;

	return live;
});

