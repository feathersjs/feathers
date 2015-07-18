/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/mustache/system*/
var can = require('./mustache.js');
function translate(load) {
    return 'define([\'can/view/mustache/mustache\'],function(can){' + 'return can.view.preloadStringRenderer(\'' + load.metadata.pluginArgument + '\',' + 'can.Mustache(function(scope,options) { ' + new can.Mustache({
        text: load.source,
        name: load.name
    }).template.out + ' })' + ')' + '})';
}
module.exports = { translate: translate };
