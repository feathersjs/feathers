/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/node_lists/node_lists*/
// # can/view/node_lists/node_list.js
// 
// `can.view.nodeLists` are used to make sure "directly nested" live-binding
// sections update content correctly.
// 
// Consider the following template:
//
// ```
// <div>
// {{#if items.length}}
//     Items:
//         {{#items}}
//             <label></label>
//         {{/items}}
// {{/if}}
// </div>
// ```
//
// The `{{#if}}` and `{{#items}}` seconds are "directly nested" because
// they share the same `<div>` parent element.
//
// If `{{#items}}` changes the DOM by adding more `<labels>`,
// `{{#if}}` needs to know about the `<labels>` to remove them
// if `{{#if}}` is re-rendered.  `{{#if}}` would be re-rendered, for example, if
// all items were removed.
steal('can/util', 'can/view/elements.js', function (can) {
	// ## Helpers
	// Some browsers don't allow expando properties on HTMLTextNodes
	// so let's try to assign a custom property, an 'expando' property.
	// We use this boolean to determine how we are going to hold on
	// to HTMLTextNode within a nodeList.  More about this in the 'id'
	// function.
	var canExpando = true;
	try {
		document.createTextNode('')._ = 0;
	} catch (ex) {
		canExpando = false;
	}
	
	// A mapping of element ids to nodeList id allowing us to quickly find an element
	// that needs to be replaced when updated.
	var nodeMap = {},
		// A mapping of ids to text nodes, this map will be used in the 
		// case of the browser not supporting expando properties.
		textNodeMap = {},
		// The name of the expando property; the value returned 
		// given a nodeMap key.
		expando = 'ejs_' + Math.random(),
		// The id used as the key in our nodeMap, this integer
		// will be preceded by 'element_' or 'obj_' depending on whether
		// the element has a nodeName.
		_id = 0,

		// ## nodeLists.id
		// Given a template node, create an id on the node as a expando
		// property, or if the node is an HTMLTextNode and the browser
		// doesn't support expando properties store the id with a
		// reference to the text node in an internal collection then return
		// the lookup id.
		id = function (node, localMap) {
			var _textNodeMap = localMap || textNodeMap;
			var id = readId(node,_textNodeMap);
			if(id) {
				return id;
			} else {
				// If the browser supports expando properties or the node
				// provided is not an HTMLTextNode, we don't need to work
				// with the internal textNodeMap and we can place the property
				// on the node.
				if (canExpando || node.nodeType !== 3) {
					++_id;
					return node[expando] = (node.nodeName ? 'element_' : 'obj_') + _id;
				} else {
					// If we didn't find the node, we need to register it and return
					// the id used.
					++_id;
	
					// If we didn't find the node, we need to register it and return
					// the id used.
					// 
					// We have to store the node itself because of the browser's lack
					// of support for expando properties (i.e. we can't use a look-up
					// table and store the id on the node as a custom property).
					_textNodeMap['text_' + _id] = node;
					return 'text_' + _id;
				}
			}
		},
		readId = function(node,textNodeMap){
			if (canExpando || node.nodeType !== 3) {
				return node[expando];
			} else {
				// The nodeList has a specific collection for HTMLTextNodes for 
				// (older) browsers that do not support expando properties.
				for (var textNodeID in textNodeMap) {
					if (textNodeMap[textNodeID] === node) {
						return textNodeID;
					}
				}
			}
		},
		splice = [].splice,
		push = [].push,

		// ## nodeLists.itemsInChildListTree
		// Given a nodeList return the number of child items in the provided
		// list and any child lists.
		itemsInChildListTree = function(list){
			var count = 0;
			for(var i = 0, len = list.length ; i < len; i++){
				var item = list[i];
				// If the item is an HTMLElement then increment the count by 1.
				if(item.nodeType) {
					count++;
				} else {
					// If the item is not an HTMLElement it is a list, so
					// increment the count by the number of items in the child
					// list.
					count += itemsInChildListTree(item);
				}
			}
			return count;
		},
		replacementMap = function(replacements, idMap){
			var map = {};
			for(var i = 0, len = replacements.length; i < len; i++){
				var node = nodeLists.first(replacements[i]);
				map[id(node, idMap)] = replacements[i];
			}
			return map;
		};

	// ## Registering & Updating
	// 
	// To keep all live-bound sections knowing which elements they are managing,
	// all live-bound elments are registered and updated when they change.
	//
	// For example, the above template, when rendered with data like:
	// 
	//     data = new can.Map({
	//         items: ["first","second"]
	//     })
	//
	// This will first render the following content:
	// 
	//     <div>
	//         <span data-view-id='5'/>
	//     </div>
	// 
	// When the `5` callback is called, this will register the `<span>` like:
	// 
	//     var ifsNodes = [<span 5>]
	//     nodeLists.register(ifsNodes);
	// 
	// And then render `{{if}}`'s contents and update `ifsNodes` with it:
	//
	//     nodeLists.update( ifsNodes, [<"\nItems:\n">, <span data-view-id="6">] );
	//
	// Next, hookup `6` is called which will regsiter the `<span>` like:
	//
	//     var eachsNodes = [<span 6>];
	//     nodeLists.register(eachsNodes);
	//
	// And then it will render `{{#each}}`'s content and update `eachsNodes` with it:
	//
	//     nodeLists.update(eachsNodes, [<label>,<label>]);
	//
	// As `nodeLists` knows that `eachsNodes` is inside `ifsNodes`, it also updates
	// `ifsNodes`'s nodes to look like:
	//
	//     [<"\nItems:\n">,<label>,<label>]
	//
	// Now, if all items were removed, `{{#if}}` would be able to remove
	// all the `<label>` elements.
	//
	// When you regsiter a nodeList, you can also provide a callback to know when
	// that nodeList has been replaced by a parent nodeList.  This is
	// useful for tearing down live-binding.
	var nodeLists = {
		id: id,
		
		// ## nodeLists.update
		// Updates a nodeList with new items, i.e. when values for the template have changed.
		update: function (nodeList, newNodes) {
			// Unregister all childNodeLists.
			var oldNodes = nodeLists.unregisterChildren(nodeList);
			
			newNodes = can.makeArray(newNodes);

			var oldListLength = nodeList.length;
			
			// Replace oldNodeLists's contents.
			splice.apply(nodeList, [
				0,
				oldListLength
			].concat(newNodes));

			if(nodeList.replacements){
				nodeLists.nestReplacements(nodeList);
			} else {
				nodeLists.nestList(nodeList);
			}
			
			return oldNodes;
		},
		// Goes through each node in the list. [el1, el2, el3, ...]
		// Ginds the nodeList for that node in repacements.  el1's nodeList might look like [el1, [el2]].
		// Replaces that element and any other elements in the node list with the 
		// nodelist itself. resulting in [ [el1, [el2]], el3, ...]
		nestReplacements: function(list){
			var index = 0,
				// temporary id map that is limited to this call
				idMap = {},
				// replacements are in reverse order in the DOM
				rMap = replacementMap(list.replacements, idMap),
				rCount = list.replacements.length;
			
			while(index < list.length && rCount) {
				var node = list[index],
					replacement = rMap[readId(node, idMap)];
				if( replacement ) {
					list.splice( index, itemsInChildListTree(replacement), replacement );
					rCount--;
				}
				index++;
			}
			list.replacements = [];
		},
		// ## nodeLists.nestList
		// If a given list does not exist in the nodeMap then create an lookup
		// id for it in the nodeMap and assign the list to it.
		// If the the provided does happen to exist in the nodeMap update the
		// elements in the list.
		// @param {Array.<HTMLElement>} nodeList The nodeList being nested.
		nestList: function(list){
			var index = 0;
			while(index < list.length) {
				var node = list[index],
					childNodeList = nodeMap[id(node)];
				if(childNodeList) {
					if(childNodeList !== list) {
						list.splice( index, itemsInChildListTree(childNodeList), childNodeList );
					}
				} else {
					// Indicate the new nodes belong to this list.
					nodeMap[id(node)] = list;
				}
				index++;
			}
		},

		// ## nodeLists.last
		// Return the last HTMLElement in a nodeList, if the last
		// element is a nodeList, returns the last HTMLElement of
		// the child list, etc.
		last: function(nodeList){
			var last = nodeList[nodeList.length - 1];
			// If the last node in the list is not an HTMLElement
			// it is a nodeList so call `last` again.
			if(last.nodeType) {
				return last;
			} else {
				return nodeLists.last(last);
			}
		},

		// ## nodeLists.first
		// Return the first HTMLElement in a nodeList, if the first
		// element is a nodeList, returns the first HTMLElement of
		// the child list, etc.
		first: function(nodeList) {
			var first = nodeList[0];
			// If the first node in the list is not an HTMLElement
			// it is a nodeList so call `first` again. 
			if(first.nodeType) {
				return first;
			} else {
				return nodeLists.first(first);
			}
		},
		flatten: function(nodeList){
			var items = [];
			for(var i = 0 ; i < nodeList.length; i++) {
				var item = nodeList[i];
				if(item.nodeType) {
					items.push(item);
				} else {
					items.push.apply(items, nodeLists.flatten(item));
				}
			}
			return items;
		},
		// ## nodeLists.register
		// Registers a nodeList and returns the nodeList passed to register
		register: function (nodeList, unregistered, parent) {
			// If a unregistered callback has been provided assign it to the nodeList
			// as a property to be called when the nodeList is unregistred.
			nodeList.unregistered = unregistered;
			nodeList.parentList = parent;
			
			if(parent === true) {
				// this is the "top" parent in stache
				nodeList.replacements = [];
			} else if(parent) {
				// TOOD: remove
				parent.replacements.push(nodeList);
				nodeList.replacements = [];
			} else {
				nodeLists.nestList(nodeList);
			}
			
			
			return nodeList;
		},
		
		// ## nodeLists.unregisterChildren
		// Unregister all childen within the provided list and return the 
		// unregistred nodes.
		// @param {Array.<HTMLElement>} nodeList The child list to unregister.
		unregisterChildren: function(nodeList){
			var nodes = [];
			// For each node in the nodeList we want to compute it's id
			// and delete it from the nodeList's internal map.
			can.each(nodeList, function (node) {
				// If the node does not have a nodeType it is an array of
				// nodes.
				if(node.nodeType) {
					if(!nodeList.replacements) {
						delete nodeMap[id(node)];
					}

					nodes.push(node);
				} else {
					// Recursively unregister each of the child lists in 
					// the nodeList.
					push.apply(nodes, nodeLists.unregister(node));
				}
			});
			return nodes;
		},

		// ## nodeLists.unregister
		// Unregister's a nodeList and returns the unregistered nodes.  
		// Call if the nodeList is no longer being updated. This will 
		// also unregister all child nodeLists.
		unregister: function (nodeList) {
			var nodes = nodeLists.unregisterChildren(nodeList);
			// If an 'unregisted' function was provided during registration, remove
			// it from the list, and call the function provided.
			if (nodeList.unregistered) {
				var unregisteredCallback = nodeList.unregistered;
				delete nodeList.unregistered;
				delete nodeList.replacements;
				unregisteredCallback();
			}
			return nodes;
		},

		nodeMap: nodeMap
	};
	can.view.nodeLists = nodeLists;
	return nodeLists;
});

