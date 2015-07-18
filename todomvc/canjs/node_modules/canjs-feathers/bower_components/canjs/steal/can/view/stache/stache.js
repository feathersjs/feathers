/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/stache/stache*/
/* jshint undef: false */
steal(
	"can/util",
	"can/view/parser",
	"can/view/target",
	"./html_section.js",
	"./text_section.js",
	"./mustache_core.js",
	"./mustache_helpers.js",
	"./intermediate_and_imports.js",
	"can/view/callbacks",
	"can/view/bindings",
	function(can, parser, target,  HTMLSectionBuilder, TextSectionBuilder, mustacheCore, mustacheHelpers, getIntermediateAndImports, viewCallbacks ){


	// Make sure that we can also use our modules with Stache as a plugin
	parser = parser || can.view.parser;
	viewCallbacks = viewCallbacks || can.view.callbacks;

	var svgNamespace = "http://www.w3.org/2000/svg";
	var namespaces = {
		"svg": svgNamespace,
		// this allows a partial to start with g.
		"g": svgNamespace
	};

	function stache(template){
		
		// Remove line breaks according to mustache's specs.
		if(typeof template === "string") {
			template = mustacheCore.cleanLineEndings(template);
		}
		
		// The HTML section that is the root section for the entire template.
		var section = new HTMLSectionBuilder(),
			// Tracks the state of the parser.
			state = {
				node: null,
				attr: null,
				// A stack of which node / section we are in.
				// There is probably a better way of doing this.
				sectionElementStack: [],
				// If text should be inserted and HTML escaped
				text: false,
				// which namespace we are in
				namespaceStack: []
			},
			// This function is a catch all for taking a section and figuring out
			// how to create a "renderer" that handles the functionality for a 
			// given section and modify the section to use that renderer.
			// For example, if an HTMLSection is passed with mode `#` it knows to 
			// create a liveBindingBranchRenderer and pass that to section.add.
			makeRendererAndUpdateSection = function(section, mode, stache){
				
				if(mode === ">") {
					// Partials use liveBindingPartialRenderers
					section.add(mustacheCore.makeLiveBindingPartialRenderer(stache, state));

				} else if(mode === "/") {
					
					section.endSection();
					if(section instanceof HTMLSectionBuilder) {
						state.sectionElementStack.pop();
					}
				} else if(mode === "else") {
					
					section.inverse();
					
				} else {
					
					// If we are an HTMLSection, we will generate a 
					// a LiveBindingBranchRenderer; otherwise, a StringBranchRenderer.
					// A LiveBindingBranchRenderer function processes
					// the mustache text, and sets up live binding if an observable is read.
					// A StringBranchRenderer function processes the mustache text and returns a 
					// text value.  
					var makeRenderer = section instanceof HTMLSectionBuilder ?
						
						mustacheCore.makeLiveBindingBranchRenderer:
						mustacheCore.makeStringBranchRenderer;
						
					
					if(mode === "{" || mode === "&") {
					
						// Adds a renderer function that just reads a value or calls a helper.
						section.add( makeRenderer(null,stache, copyState() ));
					
					} else if(mode === "#" || mode === "^") {
						// Adds a renderer function and starts a section.
						section.startSection(makeRenderer(mode,stache, copyState()  ));
						// If we are a directly nested section, count how many we are within
						if(section instanceof HTMLSectionBuilder) {
							state.sectionElementStack.push("section");
						}
					} else {
						// Adds a renderer function that only updates text.
						section.add( makeRenderer(null,stache, copyState({text: true}) ));
					}
					
				}
			},
			// Copys the state object for use in renderers.
			copyState = function(overwrites){
				var lastElement = state.sectionElementStack[state.sectionElementStack.length - 1];
				var cur = {
					tag: state.node && state.node.tag,
					attr: state.attr && state.attr.name,
					// <content> elements should be considered direclty nested
					directlyNested: state.sectionElementStack.length ?
						lastElement === "section" || lastElement === "custom": true
				};
				return overwrites ? can.simpleExtend(cur, overwrites) : cur;
			},
			addAttributesCallback = function(node, callback){
				if( !node.attributes ) {
					node.attributes = [];
				}
				node.attributes.push(callback);
			};
		
		parser(template,{
			start: function(tagName, unary){
				var matchedNamespace = namespaces[tagName];
				
				if (matchedNamespace && !unary ) {
					state.namespaceStack.push(matchedNamespace);
				}
				
				state.node = {
					tag: tagName,
					children: [],
					namespace: matchedNamespace || can.last(state.namespaceStack)
				};
			},
			end: function(tagName, unary){
				var isCustomTag =  viewCallbacks.tag(tagName);
				
				if(unary){
					// If it's a custom tag with content, we need a section renderer.
					section.add(state.node);
					if(isCustomTag) {
						addAttributesCallback(state.node, function(scope, options, parentNodeList){
							viewCallbacks.tagHandler(this,tagName, {
								scope: scope,
								options: options,
								subtemplate: null,
								templateType: "stache",
								parentNodeList: parentNodeList
							});
						});
					}
				} else {
					section.push(state.node);
					
					state.sectionElementStack.push( isCustomTag ? 'custom': 'element' );
					
					// If it's a custom tag with content, we need a section renderer.
					if( isCustomTag ) {
						section.startSubSection();
					}
				}
				
				
				state.node =null;
				
			},
			close: function( tagName ) {
				var matchedNamespace = namespaces[tagName];
				
				if (matchedNamespace  ) {
					state.namespaceStack.pop();
				}
				
				var isCustomTag = viewCallbacks.tag(tagName),
					renderer;
				
				if( isCustomTag ) {
					renderer = section.endSubSectionAndReturnRenderer();
				}
				
				var oldNode = section.pop();
				if( isCustomTag ) {
					addAttributesCallback(oldNode, function(scope, options, parentNodeList){
						viewCallbacks.tagHandler(this,tagName, {
							scope: scope,
							options: options,
							subtemplate: renderer,
							templateType: "stache",
							parentNodeList: parentNodeList
						});
					});
				}
				state.sectionElementStack.pop();
			},
			attrStart: function(attrName){
				if(state.node.section) {
					state.node.section.add(attrName+"=\"");
				} else {
					state.attr = {
						name: attrName,
						value: ""
					};
				}
				
			},
			attrEnd: function(attrName){
				if(state.node.section) {
					state.node.section.add("\" ");
				} else {
					if(!state.node.attrs) {
						state.node.attrs = {};
					}
					
					state.node.attrs[state.attr.name] =
						state.attr.section ? state.attr.section.compile(copyState()) : state.attr.value;
					
					var attrCallback = viewCallbacks.attr(attrName);
					if(attrCallback) {
						if( !state.node.attributes ) {
							state.node.attributes = [];
						}
						state.node.attributes.push(function(scope, options){
							attrCallback(this,{
								attributeName: attrName,
								scope: scope,
								options: options
							});
						});
					}
					
					
					
					state.attr = null;
				}
			},
			attrValue: function(value){
				var section = state.node.section || state.attr.section;
				if(section){
					section.add(value);
				} else {
					state.attr.value += value;
				}
			},
			chars: function( text ) {
				section.add(text);
			},
			special: function( text ){
				
				
				var firstAndText = mustacheCore.splitModeFromExpression(text, state),
					mode = firstAndText.mode,
					expression = firstAndText.expression;
				
				
				if(expression === "else") {
					(state.attr && state.attr.section ? state.attr.section : section).inverse();
					return;
				}
				
				if(mode === "!") {
					return;
				}

				if(state.node && state.node.section) {
					
					makeRendererAndUpdateSection(state.node.section, mode, expression);
					
					if(state.node.section.subSectionDepth() === 0){
						state.node.attributes.push( state.node.section.compile(copyState()) );
						delete state.node.section;
					}
					
				}
				// `{{}}` in an attribute like `class="{{}}"`
				else if(state.attr) {
					
					if(!state.attr.section) {
						state.attr.section = new TextSectionBuilder();
						if(state.attr.value) {
							state.attr.section.add(state.attr.value);
						}
					}
					makeRendererAndUpdateSection(state.attr.section, mode, expression );
				}
				// `{{}}` in a tag like `<div {{}}>`
				else if(state.node) {
					
					if(!state.node.attributes) {
						state.node.attributes = [];
					}
					if(!mode) {
						state.node.attributes.push( mustacheCore.makeLiveBindingBranchRenderer( null,expression, copyState() ) );
					} else if( mode === "#" || mode === "^" ) {
						if(!state.node.section) {
							state.node.section = new TextSectionBuilder();
						}
						makeRendererAndUpdateSection(state.node.section, mode, expression );
					} else {
						throw mode+" is currently not supported within a tag.";
					}
					
					
					
				} else {
					makeRendererAndUpdateSection(section, mode, expression );
				}
			},
			comment: function( text ) {
				// create comment node
				section.add({
					comment: text
				});
			},
			done: function(){}
		});

		return section.compile();
	}
	var escMap = {
		'\n': "\\n",
		'\r': "\\r",
		'\u2028': "\\u2028",
		'\u2029': "\\u2029"
	};
	var esc = function(string){
		return ('' + string).replace(/["'\\\n\r\u2028\u2029]/g, function (character) {
			if("'\"\\".indexOf(character) >= 0) {
				return "\\"+character;
			} else  {
				return escMap[character];
			}
		});
	};
	
	can.view.register({
		suffix: "stache",

		contentType: "x-stache-template",

		// Returns a `function` that renders the view.
		fragRenderer: function(id, text) {
			return stache(text);
		},
		script: function (id, src) {
			return "can.stache(\""+esc(src)+"\")";
		}
	});
	can.view.ext = ".stache";
	
	// At this point, can.stache has been created
	can.extend(can.stache, mustacheHelpers);
	
	// Copy helpers on raw stache function too so it can be used by stealing it.
	can.extend(stache, mustacheHelpers);
	
	can.stache.safeString = stache.safeString = function(text){
		return {
				toString: function () {
					return text;
				}
			};
	};
	can.stache.async = function(source){
		var iAi = getIntermediateAndImports(source);
		var importPromises = can.map( iAi.imports, function(moduleName){
			return can["import"](moduleName);
		});
		return can.when.apply(can, importPromises ).then(function(){
			return stache(iAi.intermediate);
		});
	};

	return stache;
});

