/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/node_lists/node_lists*/
define([
    'can/util/library',
    'can/elements'
], function (can) {
    var canExpando = true;
    try {
        document.createTextNode('')._ = 0;
    } catch (ex) {
        canExpando = false;
    }
    var nodeMap = {}, textNodeMap = {}, expando = 'ejs_' + Math.random(), _id = 0, id = function (node, localMap) {
            var _textNodeMap = localMap || textNodeMap;
            var id = readId(node, _textNodeMap);
            if (id) {
                return id;
            } else {
                if (canExpando || node.nodeType !== 3) {
                    ++_id;
                    return node[expando] = (node.nodeName ? 'element_' : 'obj_') + _id;
                } else {
                    ++_id;
                    _textNodeMap['text_' + _id] = node;
                    return 'text_' + _id;
                }
            }
        }, readId = function (node, textNodeMap) {
            if (canExpando || node.nodeType !== 3) {
                return node[expando];
            } else {
                for (var textNodeID in textNodeMap) {
                    if (textNodeMap[textNodeID] === node) {
                        return textNodeID;
                    }
                }
            }
        }, splice = [].splice, push = [].push, itemsInChildListTree = function (list) {
            var count = 0;
            for (var i = 0, len = list.length; i < len; i++) {
                var item = list[i];
                if (item.nodeType) {
                    count++;
                } else {
                    count += itemsInChildListTree(item);
                }
            }
            return count;
        }, replacementMap = function (replacements, idMap) {
            var map = {};
            for (var i = 0, len = replacements.length; i < len; i++) {
                var node = nodeLists.first(replacements[i]);
                map[id(node, idMap)] = replacements[i];
            }
            return map;
        };
    var nodeLists = {
            id: id,
            update: function (nodeList, newNodes) {
                var oldNodes = nodeLists.unregisterChildren(nodeList);
                newNodes = can.makeArray(newNodes);
                var oldListLength = nodeList.length;
                splice.apply(nodeList, [
                    0,
                    oldListLength
                ].concat(newNodes));
                if (nodeList.replacements) {
                    nodeLists.nestReplacements(nodeList);
                } else {
                    nodeLists.nestList(nodeList);
                }
                return oldNodes;
            },
            nestReplacements: function (list) {
                var index = 0, idMap = {}, rMap = replacementMap(list.replacements, idMap), rCount = list.replacements.length;
                while (index < list.length && rCount) {
                    var node = list[index], replacement = rMap[readId(node, idMap)];
                    if (replacement) {
                        list.splice(index, itemsInChildListTree(replacement), replacement);
                        rCount--;
                    }
                    index++;
                }
                list.replacements = [];
            },
            nestList: function (list) {
                var index = 0;
                while (index < list.length) {
                    var node = list[index], childNodeList = nodeMap[id(node)];
                    if (childNodeList) {
                        if (childNodeList !== list) {
                            list.splice(index, itemsInChildListTree(childNodeList), childNodeList);
                        }
                    } else {
                        nodeMap[id(node)] = list;
                    }
                    index++;
                }
            },
            last: function (nodeList) {
                var last = nodeList[nodeList.length - 1];
                if (last.nodeType) {
                    return last;
                } else {
                    return nodeLists.last(last);
                }
            },
            first: function (nodeList) {
                var first = nodeList[0];
                if (first.nodeType) {
                    return first;
                } else {
                    return nodeLists.first(first);
                }
            },
            flatten: function (nodeList) {
                var items = [];
                for (var i = 0; i < nodeList.length; i++) {
                    var item = nodeList[i];
                    if (item.nodeType) {
                        items.push(item);
                    } else {
                        items.push.apply(items, nodeLists.flatten(item));
                    }
                }
                return items;
            },
            register: function (nodeList, unregistered, parent) {
                nodeList.unregistered = unregistered;
                nodeList.parentList = parent;
                if (parent === true) {
                    nodeList.replacements = [];
                } else if (parent) {
                    parent.replacements.push(nodeList);
                    nodeList.replacements = [];
                } else {
                    nodeLists.nestList(nodeList);
                }
                return nodeList;
            },
            unregisterChildren: function (nodeList) {
                var nodes = [];
                can.each(nodeList, function (node) {
                    if (node.nodeType) {
                        if (!nodeList.replacements) {
                            delete nodeMap[id(node)];
                        }
                        nodes.push(node);
                    } else {
                        push.apply(nodes, nodeLists.unregister(node));
                    }
                });
                return nodes;
            },
            unregister: function (nodeList) {
                var nodes = nodeLists.unregisterChildren(nodeList);
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
