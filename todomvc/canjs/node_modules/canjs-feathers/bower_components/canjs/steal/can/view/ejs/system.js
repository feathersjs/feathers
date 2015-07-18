/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/ejs/system*/
"format steal";
steal("can/view/ejs", function(can){

	function translate(load) {
		return "define(['can/view/ejs/ejs'],function(can){" +
			"return can.view.preloadStringRenderer('" + load.metadata.pluginArgument + "'," +
			'can.EJS(function(_CONTEXT,_VIEW) { ' + new can.EJS({
				text: load.source,
				name: load.name
			})
			.template.out + ' })' +
			")" +
			"})";
	}

	return {
		translate: translate
	};

});

