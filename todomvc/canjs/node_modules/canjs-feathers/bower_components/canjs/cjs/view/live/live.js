/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/live/live*/
var can = require('../../util/util.js');
var elements = require('../elements.js');
var view = require('../view.js');
var nodeLists = require('../node_lists/node_lists.js');
var parser = require('../parser/parser.js');
elements = elements || can.view.elements;
nodeLists = nodeLists || can.view.NodeLists;
parser = parser || can.view.parser;
var setup = function (el, bind, unbind) {
        var tornDown = false, teardown = function () {
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
    }, listen = function (el, compute, change) {
        return setup(el, function () {
            compute.bind('change', change);
        }, function (data) {
            compute.unbind('change', change);
            if (data.nodeList) {
                nodeLists.unregister(data.nodeList);
            }
        });
    }, getAttributeParts = function (newVal) {
        var attrs = {}, attr;
        parser.parseAttrs(newVal, {
            attrStart: function (name) {
                attrs[name] = '';
                attr = name;
            },
            attrValue: function (value) {
                attrs[attr] += value;
            },
            attrEnd: function () {
            }
        });
        return attrs;
    }, splice = [].splice, isNode = function (obj) {
        return obj && obj.nodeType;
    }, addTextNodeIfNoChildren = function (frag) {
        if (!frag.childNodes.length) {
            frag.appendChild(document.createTextNode(''));
        }
    };
var live = {
        list: function (el, compute, render, context, parentNode, nodeList) {
            var masterNodeList = nodeList || [el], indexMap = [], afterPreviousEvents = false, isTornDown = false, add = function (ev, items, index) {
                    if (!afterPreviousEvents) {
                        return;
                    }
                    var frag = document.createDocumentFragment(), newNodeLists = [], newIndicies = [];
                    can.each(items, function (item, key) {
                        var itemNodeList = [];
                        if (nodeList) {
                            nodeLists.register(itemNodeList, null, true);
                        }
                        var itemIndex = can.compute(key + index), itemHTML = render.call(context, item, itemIndex, itemNodeList), gotText = typeof itemHTML === 'string', itemFrag = can.frag(itemHTML);
                        itemFrag = gotText ? can.view.hookup(itemFrag) : itemFrag;
                        var childNodes = can.makeArray(itemFrag.childNodes);
                        if (nodeList) {
                            nodeLists.update(itemNodeList, childNodes);
                            newNodeLists.push(itemNodeList);
                        } else {
                            newNodeLists.push(nodeLists.register(childNodes));
                        }
                        frag.appendChild(itemFrag);
                        newIndicies.push(itemIndex);
                    });
                    var masterListIndex = index + 1;
                    if (!masterNodeList[masterListIndex]) {
                        elements.after(masterListIndex === 1 ? [text] : [nodeLists.last(masterNodeList[masterListIndex - 1])], frag);
                    } else {
                        var el = nodeLists.first(masterNodeList[masterListIndex]);
                        can.insertBefore(el.parentNode, frag, el);
                    }
                    splice.apply(masterNodeList, [
                        masterListIndex,
                        0
                    ].concat(newNodeLists));
                    splice.apply(indexMap, [
                        index,
                        0
                    ].concat(newIndicies));
                    for (var i = index + newIndicies.length, len = indexMap.length; i < len; i++) {
                        indexMap[i](i);
                    }
                }, remove = function (ev, items, index, duringTeardown, fullTeardown) {
                    if (!afterPreviousEvents) {
                        return;
                    }
                    if (!duringTeardown && data.teardownCheck(text.parentNode)) {
                        return;
                    }
                    if (index < 0) {
                        index = indexMap.length + index;
                    }
                    var removedMappings = masterNodeList.splice(index + 1, items.length), itemsToRemove = [];
                    can.each(removedMappings, function (nodeList) {
                        var nodesToRemove = nodeLists.unregister(nodeList);
                        [].push.apply(itemsToRemove, nodesToRemove);
                    });
                    indexMap.splice(index, items.length);
                    for (var i = index, len = indexMap.length; i < len; i++) {
                        indexMap[i](i);
                    }
                    if (!fullTeardown) {
                        can.remove(can.$(itemsToRemove));
                    } else {
                        nodeLists.unregister(masterNodeList);
                    }
                }, move = function (ev, item, newIndex, currentIndex) {
                    if (!afterPreviousEvents) {
                        return;
                    }
                    newIndex = newIndex + 1;
                    currentIndex = currentIndex + 1;
                    var referenceNodeList = masterNodeList[newIndex];
                    var movedElements = can.frag(nodeLists.flatten(masterNodeList[currentIndex]));
                    var referenceElement;
                    if (currentIndex < newIndex) {
                        referenceElement = nodeLists.last(referenceNodeList).nextSibling;
                    } else {
                        referenceElement = nodeLists.first(referenceNodeList);
                    }
                    var parentNode = masterNodeList[0].parentNode;
                    parentNode.insertBefore(movedElements, referenceElement);
                    var temp = masterNodeList[currentIndex];
                    [].splice.apply(masterNodeList, [
                        currentIndex,
                        1
                    ]);
                    [].splice.apply(masterNodeList, [
                        newIndex,
                        0,
                        temp
                    ]);
                }, text = document.createTextNode(''), list, teardownList = function (fullTeardown) {
                    if (list && list.unbind) {
                        list.unbind('add', add).unbind('remove', remove).unbind('move', move);
                    }
                    remove({}, { length: masterNodeList.length - 1 }, 0, true, fullTeardown);
                }, updateList = function (ev, newList, oldList) {
                    if (isTornDown) {
                        return;
                    }
                    teardownList();
                    list = newList || [];
                    if (list.bind) {
                        list.bind('add', add).bind('remove', remove).bind('move', move);
                    }
                    afterPreviousEvents = true;
                    add({}, list, 0);
                    afterPreviousEvents = false;
                    can.batch.afterPreviousEvents(function () {
                        afterPreviousEvents = true;
                    });
                };
            parentNode = elements.getParentNode(el, parentNode);
            var data = setup(parentNode, function () {
                    if (can.isFunction(compute)) {
                        compute.bind('change', updateList);
                    }
                }, function () {
                    if (can.isFunction(compute)) {
                        compute.unbind('change', updateList);
                    }
                    teardownList(true);
                });
            if (!nodeList) {
                live.replace(masterNodeList, text, data.teardownCheck);
            } else {
                elements.replace(masterNodeList, text);
                nodeLists.update(masterNodeList, [text]);
                nodeList.unregistered = function () {
                    data.teardownCheck();
                    isTornDown = true;
                };
            }
            updateList({}, can.isFunction(compute) ? compute() : compute);
        },
        html: function (el, compute, parentNode, nodeList) {
            var data;
            parentNode = elements.getParentNode(el, parentNode);
            data = listen(parentNode, compute, function (ev, newVal, oldVal) {
                var attached = nodeLists.first(nodes).parentNode;
                if (attached) {
                    makeAndPut(newVal);
                }
                data.teardownCheck(nodeLists.first(nodes).parentNode);
            });
            var nodes = nodeList || [el], makeAndPut = function (val) {
                    var isFunction = typeof val === 'function', aNode = isNode(val), frag = can.frag(isFunction ? '' : val), oldNodes = can.makeArray(nodes);
                    addTextNodeIfNoChildren(frag);
                    if (!aNode && !isFunction) {
                        frag = can.view.hookup(frag, parentNode);
                    }
                    oldNodes = nodeLists.update(nodes, frag.childNodes);
                    if (isFunction) {
                        val(frag.childNodes[0]);
                    }
                    elements.replace(oldNodes, frag);
                };
            data.nodeList = nodes;
            if (!nodeList) {
                nodeLists.register(nodes, data.teardownCheck);
            } else {
                nodeList.unregistered = data.teardownCheck;
            }
            makeAndPut(compute());
        },
        replace: function (nodes, val, teardown) {
            var oldNodes = nodes.slice(0), frag = can.frag(val);
            nodeLists.register(nodes, teardown);
            if (typeof val === 'string') {
                frag = can.view.hookup(frag, nodes[0].parentNode);
            }
            nodeLists.update(nodes, frag.childNodes);
            elements.replace(oldNodes, frag);
            return nodes;
        },
        text: function (el, compute, parentNode, nodeList) {
            var parent = elements.getParentNode(el, parentNode);
            var data = listen(parent, compute, function (ev, newVal, oldVal) {
                    if (typeof node.nodeValue !== 'unknown') {
                        node.nodeValue = can.view.toStr(newVal);
                    }
                    data.teardownCheck(node.parentNode);
                });
            var node = document.createTextNode(can.view.toStr(compute()));
            if (nodeList) {
                nodeList.unregistered = data.teardownCheck;
                data.nodeList = nodeList;
                nodeLists.update(nodeList, [node]);
                elements.replace([el], node);
            } else {
                data.nodeList = live.replace([el], node, data.teardownCheck);
            }
        },
        setAttributes: function (el, newVal) {
            var attrs = getAttributeParts(newVal);
            for (var name in attrs) {
                can.attr.set(el, name, attrs[name]);
            }
        },
        attributes: function (el, compute, currentValue) {
            var oldAttrs = {};
            var setAttrs = function (newVal) {
                var newAttrs = getAttributeParts(newVal), name;
                for (name in newAttrs) {
                    var newValue = newAttrs[name], oldValue = oldAttrs[name];
                    if (newValue !== oldValue) {
                        can.attr.set(el, name, newValue);
                    }
                    delete oldAttrs[name];
                }
                for (name in oldAttrs) {
                    elements.removeAttr(el, name);
                }
                oldAttrs = newAttrs;
            };
            listen(el, compute, function (ev, newVal) {
                setAttrs(newVal);
            });
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
            var wrapped = can.$(el), hooks;
            hooks = can.data(wrapped, 'hooks');
            if (!hooks) {
                can.data(wrapped, 'hooks', hooks = {});
            }
            var attr = elements.getAttr(el, attributeName), parts = attr.split(live.attributePlaceholder), goodParts = [], hook;
            goodParts.push(parts.shift(), parts.join(live.attributePlaceholder));
            if (hooks[attributeName]) {
                hooks[attributeName].computes.push(compute);
            } else {
                hooks[attributeName] = {
                    render: function () {
                        var i = 0, newAttr = attr ? attr.replace(live.attributeReplace, function () {
                                return elements.contentText(hook.computes[i++]());
                            }) : elements.contentText(hook.computes[i++]());
                        return newAttr;
                    },
                    computes: [compute],
                    batchNum: undefined
                };
            }
            hook = hooks[attributeName];
            goodParts.splice(1, 0, compute());
            elements.setAttr(el, attributeName, goodParts.join(''));
        },
        specialAttribute: function (el, attributeName, compute) {
            listen(el, compute, function (ev, newVal) {
                elements.setAttr(el, attributeName, getValue(newVal));
            });
            elements.setAttr(el, attributeName, getValue(compute()));
        },
        simpleAttribute: function (el, attributeName, compute) {
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
    val = val.replace(elements.attrReg, '').replace(newLine, '');
    return regexp.test(val) ? val.substr(1, val.length - 2) : val;
};
can.view.live = live;
module.exports = live;
