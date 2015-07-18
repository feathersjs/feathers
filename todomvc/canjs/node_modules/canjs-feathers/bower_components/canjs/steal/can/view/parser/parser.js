/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/parser/parser*/
/* jshint maxdepth:7*/
steal("can/view", function(can){
	
	
	function makeMap(str){
		var obj = {}, items = str.split(",");
		for ( var i = 0; i < items.length; i++ ) {
			obj[ items[i] ] = true;
		}
			
		return obj;
	}
	function handleIntermediate(intermediate, handler){
		for(var i = 0, len = intermediate.length; i < len; i++) {
			var item = intermediate[i];
			handler[item.tokenType].apply(handler, item.args);
		}
		return intermediate;
	}
	
	var alphaNumericHU = "-:A-Za-z0-9_",
		attributeNames = "[a-zA-Z_:]["+alphaNumericHU+":.]*",
		spaceEQspace = "\\s*=\\s*",
		dblQuote2dblQuote = "\"((?:\\\\.|[^\"])*)\"",
		quote2quote = "'((?:\\\\.|[^'])*)'",
		attributeEqAndValue = "(?:"+spaceEQspace+"(?:"+
		  "(?:\"[^\"]*\")|(?:'[^']*')|[^>\\s]+))?",
		matchStash = "\\{\\{[^\\}]*\\}\\}\\}?",
		stash = "\\{\\{([^\\}]*)\\}\\}\\}?",
		startTag = new RegExp("^<(["+alphaNumericHU+"]+)"+
				"(" +
					"(?:\\s*"+
						"(?:(?:"+
							"(?:"+attributeNames+")?"+
							attributeEqAndValue+")|"+
	                   "(?:"+matchStash+")+)"+
	                ")*"+
	            ")\\s*(\\/?)>"),
		endTag = new RegExp("^<\\/(["+alphaNumericHU+"]+)[^>]*>"),
		attr = new RegExp("(?:"+
					"(?:("+attributeNames+")|"+stash+")"+
								"(?:"+spaceEQspace+
									"(?:"+
										"(?:"+dblQuote2dblQuote+")|(?:"+quote2quote+")|([^>\\s]+)"+
									")"+
								")?)","g"),
		mustache = new RegExp(stash,"g"),
		txtBreak = /<|\{\{/;

	// Empty Elements - HTML 5
	var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");

	// Block Elements - HTML 5
	// a is traditionally inline, but should allow block-level elments inside it, so it should be treated like a block-level element when parsed
	var block = makeMap("a,address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video");

	// Inline Elements - HTML 5
	var inline = makeMap("abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

	// Elements that you can, intentionally, leave open
	// (and which close themselves)
	var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

	// Attributes that have their values filled in disabled="disabled"
	var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

	// Special Elements (can contain anything)
	var special = makeMap("script,style");

	// Callback names on `handler`.
	var tokenTypes = "start,end,close,attrStart,attrEnd,attrValue,chars,comment,special,done".split(",");

	var fn = function(){};

	var HTMLParser = function (html, handler, returnIntermediate) {
		if(typeof html === "object") {
			return handleIntermediate(html, handler);
		}
		var intermediate = [];
		handler = handler || {};
		if(returnIntermediate) {
			// overwrite handlers so they add to intermediate
			can.each(tokenTypes, function(name){
				var callback = handler[name] || fn;
				handler[name] = function(){
					if( callback.apply(this, arguments) !== false ) {
						intermediate.push({tokenType: name, args: can.makeArray(arguments)});
					}
				};
			});
		}
		
		
		function parseStartTag(tag, tagName, rest, unary) {
			tagName = tagName.toLowerCase();

			if (block[tagName]) {
				while (stack.last() && inline[stack.last()]) {
					parseEndTag("", stack.last());
				}
			}

			if (closeSelf[tagName] && stack.last() === tagName) {
				parseEndTag("", tagName);
			}
			
			unary = empty[tagName] || !!unary;
			
			handler.start(tagName, unary);
			
			if (!unary) {
				stack.push(tagName);
			}
			// find attribute or special
			HTMLParser.parseAttrs(rest, handler);


			handler.end(tagName,unary);
			
		}

		function parseEndTag(tag, tagName) {
			// If no tag name is provided, clean shop
			var pos;
			if (!tagName) {
				pos = 0;
			}
				

				// Find the closest opened tag of the same type
			else {
				for (pos = stack.length - 1; pos >= 0; pos--) {
					if (stack[pos] === tagName) {
						break;
					}
				}
					
			}
				

			if (pos >= 0) {
				// Close all the open elements, up the stack
				for (var i = stack.length - 1; i >= pos; i--) {
					if (handler.close) {
						handler.close(stack[i]);
					}
				}
					
				// Remove the open elements from the stack
				stack.length = pos;
			}
		}
		
		function parseMustache(mustache, inside){
			if(handler.special){
				handler.special(inside);
			}
		}
		
		
		var index, chars, match, stack = [], last = html;
		stack.last = function () {
			return this[this.length - 1];
		};

		while (html) {
			chars = true;

			// Make sure we're not in a script or style element
			if (!stack.last() || !special[stack.last()]) {

				// Comment
				if (html.indexOf("<!--") === 0) {
					index = html.indexOf("-->");

					if (index >= 0) {
						if (handler.comment) {
							handler.comment(html.substring(4, index));
						}
						html = html.substring(index + 3);
						chars = false;
					}

					// end tag
				} else if (html.indexOf("</") === 0) {
					match = html.match(endTag);

					if (match) {
						html = html.substring(match[0].length);
						match[0].replace(endTag, parseEndTag);
						chars = false;
					}

					// start tag
				} else if (html.indexOf("<") === 0) {
					match = html.match(startTag);

					if (match) {
						html = html.substring(match[0].length);
						match[0].replace(startTag, parseStartTag);
						chars = false;
					}
				} else if (html.indexOf("{{") === 0 ) {
					match = html.match(mustache);
					
					if (match) {
						html = html.substring(match[0].length);
						match[0].replace(mustache, parseMustache);
					}
				}

				if (chars) {
					index = html.search(txtBreak);

					var text = index < 0 ? html : html.substring(0, index);
					html = index < 0 ? "" : html.substring(index);

					if (handler.chars && text) {
						handler.chars(text);
					}
				}

			} else {
				html = html.replace(new RegExp("([\\s\\S]*?)<\/" + stack.last() + "[^>]*>"), function (all, text) {
					text = text.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, "$1$2");
					if (handler.chars) {
						handler.chars(text);
					}
					return "";
				});

				parseEndTag("", stack.last());
			}

			if (html === last) {
				throw "Parse Error: " + html;
			}
				
			last = html;
		}

		// Clean up any remaining tags
		parseEndTag();

		
		handler.done();
		return intermediate;
	};
	HTMLParser.parseAttrs = function(rest, handler){
		
		
		(rest != null ? rest : "").replace(attr, function (text, name, special, dblQuote, singleQuote, val) {
			if(special) {
				handler.special(special);
				
			}
			if(name || dblQuote || singleQuote || val) {
				var value = arguments[3] ? arguments[3] :
					arguments[4] ? arguments[4] :
					arguments[5] ? arguments[5] :
					fillAttrs[name.toLowerCase()] ? name : "";
				handler.attrStart(name || "");
				
				var last = mustache.lastIndex = 0,
					res = mustache.exec(value),
					chars;
				while(res) {
					chars = value.substring(
						last,
						mustache.lastIndex - res[0].length );
					if( chars.length ) {
						handler.attrValue(chars);
					}
					handler.special(res[1]);
					last = mustache.lastIndex;
					res = mustache.exec(value);
				}
				chars = value.substr(
						last,
						value.length );
				if(chars) {
					handler.attrValue(chars);
				}
				handler.attrEnd(name || "");
			}

			
		});
	};

	can.view.parser = HTMLParser;
	
	return HTMLParser;
	
});

