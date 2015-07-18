/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#construct/construct*/
// steal-clean
steal('can/util/string', function (can) {
	// ## construct.js
	// `can.Construct`  
	// _This is a modified version of
	// [John Resig's class](http://ejohn.org/blog/simple-javascript-inheritance/).  
	// It provides class level inheritance and callbacks._
	// A private flag used to initialize a new class instance without
	// initializing it's bindings.
	var initializing = 0;

	var canGetDescriptor;
	try {
		Object.getOwnPropertyDescriptor({});
		canGetDescriptor = true;
	} catch(e) {
		canGetDescriptor = false;
	}

	var getDescriptor = function(newProps, name) {
			var descriptor = Object.getOwnPropertyDescriptor(newProps, name);
			if(descriptor && (descriptor.get || descriptor.set)) {
				return descriptor;
			}
			return null;
		},
		inheritGetterSetter = function(newProps, oldProps, addTo) {
			addTo = addTo || newProps;
			var descriptor;

			for (var name in newProps) {
				if( (descriptor = getDescriptor(newProps, name)) ) {
					this._defineProperty(addTo, oldProps, name, descriptor);
				} else {
					can.Construct._overwrite(addTo, oldProps, name, newProps[name]);
				}
			}
		},
		simpleInherit = function (newProps, oldProps, addTo) {
			addTo = addTo || newProps;

			for (var name in newProps) {
				can.Construct._overwrite(addTo, oldProps, name, newProps[name]);
			}
		};

	/**
	 * @add can.Construct
	 */
	can.Construct = function () {
		if (arguments.length) {
			return can.Construct.extend.apply(can.Construct, arguments);
		}
	};
	/**
	 * @static
	 */
	can.extend(can.Construct, {
		/**
		 * @property {Boolean} can.Construct.constructorExtends
		 * @parent can.Construct.static
		 *
		 * @description
		 * Toggles the behavior of a constructor function called
		 * without the `new` keyword to extend the constructor function or
		 * create a new instance.
		 *
		 * ```
		 * var animal = Animal();
		 * // vs
		 * var animal = new Animal();
		 * ```
		 * 
		 * @body
		 *
		 * If `constructorExtends` is:
		 *
		 *  - `true` - the constructor extends
		 *  - `false` - a new instance of the constructor is created
		 *
		 * This property defaults to false.
		 *
		 * Example of constructExtends is true:
		 * ```
		 * var Animal = can.Construct.extend({
		 *   constructorExtends: true // the constructor extends
		 * },{
		 *   sayHi: function() {
		 *     console.log("hai!");
		 *   }
		 * });
		 *
		 * var Pony = Animal({
		 *   gallop: function () {
		 *      console.log("Galloping!!");
		 *   }
		 * }); // Pony is now a constructor function extended from Animal
		 * 
		 * var frank = new Animal(); // frank is a new instance of Animal
		 *
		 * var gertrude = new Pony(); // gertrude is a new instance of Pony
		 * gertrude.sayHi(); // "hai!" - sayHi is "inherited" from Animal
		 * gertrude.gallop(); // "Galloping!!" - gallop is unique to instances of Pony
		 *```
		 * 
		 * The default behavior is shown in the example below:
		 * ```
		 * var Animal = can.Construct.extend({
		 *   constructorExtends: false // the constructor does NOT extend
		 * },{
		 *   sayHi: function() {
		 *     console.log("hai!");
		 *   }
		 * });
		 *
		 * var pony = Animal(); // pony is a new instance of Animal
		 * var frank = new Animal(); // frank is a new instance of Animal
		 *
		 * pony.sayHi() // "hai!"
		 * frank.sayHi() // "hai!"
		 *```
		 * By default to extend a constructor, you must use [can.Construct.extend extend].
		 */
		constructorExtends: true,
		/**
		 * @function can.Construct.newInstance newInstance
		 * @parent can.Construct.static
		 *
		 * @description Returns an instance of `can.Construct`. This method
		 * can be overridden to return a cached instance.
		 *
		 * @signature `can.Construct.newInstance([...args])`
		 *
		 * @param {*} [args] arguments that get passed to [can.Construct::setup] and [can.Construct::init]. Note
		 * that if [can.Construct::setup] returns an array, those arguments will be passed to [can.Construct::init]
		 * instead.
		 * @return {class} instance of the class
		 *
		 * @body
		 * Creates a new instance of the constructor function. This method is useful for creating new instances
		 * with arbitrary parameters. Typically, however, you will simply want to call the constructor with the
		 * __new__ operator.
		 *
		 * ## Example
		 *
		 * The following creates a `Person` Construct and overrides `newInstance` to cache all 
		 * instances of Person to prevent duplication. If the properties of a new Person match an existing one it
		 * will return a reference to the previously created object, otherwise it returns a new object entirely.
		 *
		 * ```
		 * // define and create the Person constructor
		 * var Person = can.Construct.extend({
		 *   init : function(first, middle, last) {
		 *     this.first = first;
		 *     this.middle = middle;
		 *     this.last = last;
		 *   }
		 * });
		 * 
		 * // store a reference to the original newInstance function
		 * var _newInstance = Person.newInstance;
		 *
		 * // override Person's newInstance function
		 * Person.newInstance = function() {
		 * // if cache does not exist make it an new object
		 * this.__cache = this.__cache || {};
		 * // id is a stingified version of the passed arguments
		 * var id = JSON.stringify(arguments);
		 *
		 * // look in the cache to see if the object already exists
		 * var cachedInst = this.__cache[id];
		 * if(cachedInst) {
		 *     return cachedInst;
		 * }
		 *
		 * //otherwise call the original newInstance function and return a new instance of Person.
		 * var newInst = _newInstance.apply(this, arguments);
		 * this.__cache[id] = newInst;
		 * return newInst;
		 * }
		 * 
		 * // create two instances with the same arguments
		 * var justin = new Person('Justin', 'Barry', 'Meyer'),
		 *		brian = new Person('Justin', 'Barry', 'Meyer');
		 * 
		 * console.log(justin === brian); // true - both are references to the same instance
		 * ```
		 *
		 */
		newInstance: function () {
			// Get a raw instance object (`init` is not called).
			var inst = this.instance(),
				args;
			// Call `setup` if there is a `setup`
			if (inst.setup) {
				args = inst.setup.apply(inst, arguments);
			}
			// Call `init` if there is an `init`  
			// If `setup` returned `args`, use those as the arguments
			if (inst.init) {
				inst.init.apply(inst, args || arguments);
			}
			return inst;
		},
		// Overwrites an object with methods. Used in the `super` plugin.
		// `newProps` - New properties to add.
		// `oldProps` - Where the old properties might be (used with `super`).
		// `addTo` - What we are adding to.
		_inherit: canGetDescriptor ? inheritGetterSetter : simpleInherit,

		// Adds a `defineProperty` with the given name and descriptor
		// Will only ever be called if ES5 is supported
		_defineProperty: function(what, oldProps, propName, descriptor) {
			Object.defineProperty(what, propName, descriptor);
		},

		// used for overwriting a single property.
		// this should be used for patching other objects
		// the super plugin overwrites this
		_overwrite: function (what, oldProps, propName, val) {
			what[propName] = val;
		},
		// Set `defaults` as the merger of the parent `defaults` and this
		// object's `defaults`. If you overwrite this method, make sure to
		// include option merging logic.
		/**
		 * @function can.Construct.setup setup
		 * @parent can.Construct.static
		 *
		 * @description Perform initialization logic for a constructor function.
		 *
		 * @signature `can.Construct.setup(base, fullName, staticProps, protoProps)`
		 *
		 * A static `setup` method provides inheritable setup functionality
		 * for a Constructor function. The following example
		 * creates a Group constructor function.  Any constructor
		 * functions that inherit from Group will be added to
		 * `Group.childGroups`.
		 *
		 *
		 *     Group = can.Construct.extend({
		 *       setup: function(Construct, fullName, staticProps, protoProps){
		 *         this.childGroups = [];
		 *         if(Construct !== can.Construct){
		 *           this.childGroups.push(Construct)
		 *         }
		 *         Construct.setup.apply(this, arguments)
		 *       }
		 *     },{})
		 *     var Flock = Group.extend(...)
		 *     Group.childGroups[0] //-> Flock
		 *
		 * @param {constructor} base The base constructor that is being inherited from.
		 * @param {String} fullName The name of the new constructor.
		 * @param {Object} staticProps The static properties of the new constructor.
		 * @param {Object} protoProps The prototype properties of the new constructor.
		 *
		 * @body
		 * The static `setup` method is called immediately after a constructor
		 * function is created and
		 * set to inherit from its base constructor. It is useful for setting up
		 * additional inheritance work.
		 * Do not confuse this with the prototype `[can.Construct::setup]` method.
		 *
		 * ## Example
		 *
		 * This `Parent` class adds a reference to its base class to itself, and
		 * so do all the classes that inherit from it.
		 *
		 * ```
		 * Parent = can.Construct.extend({
		 *   setup : function(base, fullName, staticProps, protoProps){
		 *     this.base = base;
		 *
		 *     // call base functionality
		 *     can.Construct.setup.apply(this, arguments)
		 *   }
		 * },{});
		 *
		 * Parent.base; // can.Construct
		 *
		 * Child = Parent({});
		 *
		 * Child.base; // Parent
		 * ```
		 */
		setup: function (base, fullName) {
			this.defaults = can.extend(true, {}, base.defaults, this.defaults);
		},
		// Create's a new `class` instance without initializing by setting the
		// `initializing` flag.
		instance: function () {
			// Prevents running `init`.
			initializing = 1;
			var inst = new this();
			// Allow running `init`.
			initializing = 0;
			return inst;
		},
		// Extends classes.
		/**
		 * @function can.Construct.extend extend
		 * @parent can.Construct.static
		 *
		 * @signature `can.Construct.extend([name,] [staticProperties,] instanceProperties)`
		 *
		 * Extends `can.Construct`, or constructor functions derived from `can.Construct`,
		 * to create a new constructor function. Example:
		 *
		 *     var Animal = can.Construct.extend({
		 *       sayHi: function(){
		 *         console.log("hi")
		 *       }
		 *     })
		 *     var animal = new Animal()
		 *     animal.sayHi();
		 *
		 * @param {String} [name] Creates the necessary properties and
		 * objects that point from the `window` to the created constructor function. The following:
		 *
		 *     can.Construct.extend("company.project.Constructor",{})
		 *
		 * creates a `company` object on window if it does not find one, a
		 * `project` object on `company` if it does not find one, and it will set the
		 * `Constructor` property on the `project` object to point to the constructor function.
		 *
		 * Finally, it sets "company.project.Constructor" as [can.Construct.fullName fullName]
		 * and "Constructor" as [can.Construct.shortName shortName].
		 *
		 * @param {Object} [staticProperties] Properties that are added the constructor
		 * function directly. For example:
		 *
		 * ```
		 * var Animal = can.Construct.extend({
		 *   findAll: function(){
		 *     return can.ajax({url: "/animals"})
		 *   }
		 * },{}); // need to pass an empty instanceProperties object
		 *
		 * Animal.findAll().then(function(json){ ... })
		 * ```
		 *
		 * The [can.Construct.setup static setup] method can be used to
		 * specify inheritable behavior when a Constructor function is created.
		 *
		 * @param {Object} instanceProperties Properties that belong to
		 * instances made with the constructor. These properties are added to the
		 * constructor's `prototype` object. Example:
		 *
		 *     var Animal = can.Construct.extend({
		 *		  findAll: function() {
		 *			return can.ajax({url: "/animals"});
		 *		  }
		 *     },{
		 *       init: function(name) {
		 *         this.name = name;
		 *       },
		 *       sayHi: function() {
		 *         console.log(this.name," says hai!");
		 *       }
		 *     })
		 *     var pony = new Animal("Gertrude");
		 *     pony.sayHi(); // "Gertrude says hai!"
		 *
		 * The [can.Construct::init init] and [can.Construct::setup setup] properties
		 * are used for initialization.
		 *
		 * @return {function} The constructor function.
		 * ```
		 *	var Animal = can.Construct.extend(...);
		 *	var pony = new Animal(); // Animal is a constructor function
		 * ```
		 * @body
		 * ## Inheritance
		 * Creating "subclasses" with `can.Construct` is simple. All you need to do is call the base constructor
		 * with the new function's static and instance properties. For example, we want our `Snake` to
		 * be an `Animal`, but there are some differences:
		 * 
		 * 
		 *     var Snake = Animal.extend({
		 *         legs: 0
		 *     }, {
		 *         init: function() {
		 *             Animal.prototype.init.call(this, 'ssssss');
		 *         },
		 *         slither: function() {
		 *             console.log('slithering...');
		 *         }
		 *     });
		 *     
		 *     var baslisk = new Snake();
		 *     baslisk.speak();   // "ssssss"
		 *     baslisk.slither(); // "slithering..."
		 *     baslisk instanceof Snake;  // true
		 *     baslisk instanceof Animal; // true
		 * 
		 * 
		 * ## Static properties and inheritance
		 * 
		 * If you pass all three arguments to can.Construct, the second one will be attached directy to the
		 * constructor, allowing you to imitate static properties and functions. You can access these
		 * properties through the `[can.Construct::constructor this.constructor]` property.
		 * 
		 * Static properties can get overridden through inheritance just like instance properties. In the example below,
		 * we override both the legs static property as well as the the init function for each instance:
		 * 
		 * ```
		 * var Animal = can.Construct.extend({
		 *     legs: 4
		 * }, {
		 *     init: function(sound) {
		 *         this.sound = sound;
		 *     },
		 *     speak: function() {
		 *         console.log(this.sound);
		 *     }
		 * });
		 * 
		 * var Snake = Animal.extend({
		 *     legs: 0
		 * }, {
		 *     init: function() {
		 *         this.sound = 'ssssss';
		 *     },
		 *     slither: function() {
		 *         console.log('slithering...');
		 *     }
		 * });
		 * 
		 * Animal.legs; // 4
		 * Snake.legs; // 0
		 * var dog = new Animal('woof');
		 * var blackMamba = new Snake();
		 * dog.speak(); // 'woof'
		 * blackMamba.speak(); // 'ssssss'
		 * ```
		 */
		extend: function (name, staticProperties, instanceProperties) {
			var fullName = name,
				klass = staticProperties,
				proto = instanceProperties;

			// Figure out what was passed and normalize it.
			if (typeof fullName !== 'string') {
				proto = klass;
				klass = fullName;
				fullName = null;
			}
			if (!proto) {
				proto = klass;
				klass = null;
			}
			proto = proto || {};
			var _super_class = this,
				_super = this.prototype,
				Constructor, parts, current, _fullName, _shortName, propName, shortName, namespace, prototype;
			// Instantiate a base class (but only create the instance,
			// don't run the init constructor).
			prototype = this.instance();
			// Copy the properties over onto the new prototype.
			can.Construct._inherit(proto, _super, prototype);

			if(fullName) {
				parts = fullName.split('.');
				shortName = parts.pop();
			}
			//!steal-remove-start
			/* jshint ignore:start */
			// In dev builds we want constructor.name to be the same as shortName.
			// The only way to do that right now is using eval. jshint does not like
			// this at all so we hide it

			// Strip semicolons
			var constructorName = shortName ? shortName.replace(/;/g, '') : 'Constructor';

			// Assign a name to the constructor
			eval('Constructor = function ' + constructorName + '() { return init.apply(this, arguments); }');
			/* jshint ignore:end */
			//!steal-remove-end

			// Make sure Constructor is still defined when the constructor name
			// code is removed.
			if(typeof constructorName === 'undefined') {
				Constructor = function() {
					return init.apply(this, arguments);
				};
			}
			// The dummy class constructor.
			function init() {
				// All construction is actually done in the init method.
				if (!initializing) {
					//!steal-remove-start
					if(this.constructor !== Constructor &&
					// We are being called without `new` or we are extending.
					arguments.length && Constructor.constructorExtends) {
						can.dev.warn('can/construct/construct.js: extending a can.Construct without calling extend');
					}
					//!steal-remove-end

					return this.constructor !== Constructor &&
					// We are being called without `new` or we are extending.
					arguments.length && Constructor.constructorExtends ? Constructor.extend.apply(Constructor, arguments) :
					// We are being called with `new`.
					Constructor.newInstance.apply(Constructor, arguments);
				}
			}
			// Copy old stuff onto class (can probably be merged w/ inherit)
			for (propName in _super_class) {
				if (_super_class.hasOwnProperty(propName)) {
					Constructor[propName] = _super_class[propName];
				}
			}
			// Copy new static properties on class.
			can.Construct._inherit(klass, _super_class, Constructor);
			// Setup namespaces.
			if (fullName) {

				current = can.getObject(parts.join('.'), window, true);
				namespace = current;
				_fullName = can.underscore(fullName.replace(/\./g, "_"));
				_shortName = can.underscore(shortName);

				//!steal-remove-start
				if (current[shortName]) {
					can.dev.warn("can/construct/construct.js: There's already something called " + fullName);
				}
				//!steal-remove-end

				current[shortName] = Constructor;
			}
			// Set things that shouldn't be overwritten.
			can.extend(Constructor, {
				constructor: Constructor,
				prototype: prototype,
				/**
				 * @property {String} can.Construct.namespace namespace
				 * @parent can.Construct.static
				 *
				 * The `namespace` property returns the namespace your constructor is in.
				 * This provides a way organize code and ensure globally unique types. The
				 * `namespace` is the [can.Construct.fullName fullName] you passed without the [can.Construct.shortName shortName].
				 *
				 * ```
				 * can.Construct("MyApplication.MyConstructor",{},{});
				 * MyApplication.MyConstructor.namespace // "MyApplication"
				 * MyApplication.MyConstructor.shortName // "MyConstructor"
				 * MyApplication.MyConstructor.fullName  // "MyApplication.MyConstructor"
				 * ```
				 */
				namespace: namespace,
				/**
				 * @property {String} can.Construct.shortName shortName
				 * @parent can.Construct.static
				 *
				 * If you pass a name when creating a Construct, the `shortName` property will be set to the
				 * name you passed without the [can.Construct.namespace namespace].
				 *
				 * ```
				 * can.Construct("MyApplication.MyConstructor",{},{});
				 * MyApplication.MyConstructor.namespace // "MyApplication"
				 * MyApplication.MyConstructor.shortName // "MyConstructor"
				 * MyApplication.MyConstructor.fullName  // "MyApplication.MyConstructor"
				 * ```
				 */
				_shortName: _shortName,
				/**
				 * @property {String} can.Construct.fullName fullName
				 * @parent can.Construct.static
				 *
				 * If you pass a name when creating a Construct, the `fullName` property will be set to
				 * the name you passed. The `fullName` consists of the [can.Construct.namespace namespace] and
				 * the [can.Construct.shortName shortName].
				 *
				 * ```
				 * can.Construct("MyApplication.MyConstructor",{},{});
				 * MyApplication.MyConstructor.namespace // "MyApplication"
				 * MyApplication.MyConstructor.shortName // "MyConstructor"
				 * MyApplication.MyConstructor.fullName  // "MyApplication.MyConstructor"
				 * ```
				 */
				fullName: fullName,
				_fullName: _fullName
			});
			// Dojo and YUI extend undefined
			if (shortName !== undefined) {
				Constructor.shortName = shortName;
			}
			// Make sure our prototype looks nice.
			Constructor.prototype.constructor = Constructor;
			// Call the class `setup` and `init`
			var t = [_super_class].concat(can.makeArray(arguments)),
				args = Constructor.setup.apply(Constructor, t);
			if (Constructor.init) {
				Constructor.init.apply(Constructor, args || t);
			}
			/**
			 * @prototype
			 */
			return Constructor; //  
			/**
			 * @property {Object} can.Construct.prototype.constructor constructor
			 * @parent can.Construct.prototype
			 *
			 * A reference to the constructor function that created the instance. This allows you to access
			 * the constructor's static properties from an instance.
			 *
			 * @body
			 * ## Example
			 *
			 * This can.Construct has a static counter that counts how many instances have been created:
			 *
			 * ```
			 * var Counter = can.Construct.extend({
			 *     count: 0
			 * }, {
			 *     init: function() {
			 *         this.constructor.count++;
			 *     }
			 * });
			 *
			 * var childCounter = new Counter();
			 * console.log(childCounter.constructor.count); // 1
			 * console.log(Counter.count); // 1
			 * ```
			 */
		}
	});
	/**
	 * @function can.Construct.prototype.setup setup
	 * @parent can.Construct.prototype
	 *
	 * @signature `construct.setup(...args)`
	 *
	 * A setup function for the instantiation of a constructor function.
	 *
	 * @param {*} args The arguments passed to the constructor.
	 *
	 * @return {Array|undefined} If an array is returned, the array's items are passed as
	 * arguments to [can.Construct::init init]. The following example always makes
	 * sure that init is called with a jQuery wrapped element:
	 *
	 *     WidgetFactory = can.Construct.extend({
	 *         setup: function(element){
	 *             return [$(element)]
	 *         }
	 *     })
	 *
	 *     MyWidget = WidgetFactory.extend({
	 *         init: function($el){
	 *             $el.html("My Widget!!")
	 *         }
	 *     })
	 *
	 * Otherwise, the arguments to the
	 * constructor are passed to [can.Construct::init] and the return value of `setup` is discarded.
	 *
	 * @body
	 *
	 * ## Deciding between `setup` and `init`
	 *
	 *
	 * Usually, you should use [can.Construct::init init] to do your constructor function's initialization.
	 * Use `setup` instead for:
	 *
	 *   - initialization code that you want to run before the inheriting constructor's
	 *     `init` method is called.
	 *   - initialization code that should run whether or not inheriting constructors
	 *     call their base's `init` methods.
	 *   - modifying the arguments that will get passed to `init`.
	 *
	 * ## Example
	 *
	 * This code is a simplified version of the code in [can.Control]'s setup
	 * method. It converts the first argument to a jQuery collection and
	 * extends the controller's defaults with the options that were passed.
	 *
	 *
	 *     can.Control = can.Construct.extend({
	 *         setup: function(domElement, rawOptions) {
	 *             // set up this.element
	 *             this.element = $(domElement);
	 *
	 *             // set up this.options
	 *             this.options = can.extend({},
	 *                                   this.constructor.defaults,
	 *                                   rawOptions
	 *                                  );
	 *
	 *             // pass this.element and this.options to init.
	 *             return [this.element, this.options];
	 *         }
	 *     });
	 *
	 */
	can.Construct.prototype.setup = function () {};
	/**
	 * @function can.Construct.prototype.init init
	 * @parent can.Construct.prototype
	 *
	 * @description Called when a new instance of a can.Construct is created.
	 *
	 * @signature `construct.init(...args)`
	 * @param {*} args the arguments passed to the constructor (or the items of the array returned from [can.Construct::setup])
	 *
	 * @body
	 * If a prototype `init` method is provided, it is called when a new Construct is created,
	 * after [can.Construct::setup]. The `init` method is where the bulk of your initialization code
	 * should go, and a common thing to do in `init` is to save the arguments passed into the constructor.
	 *
	 * ## Examples
	 *
	 * First, we'll make a Person constructor that has a first and last name:
	 *
	 * ```
	 * var Person = can.Construct.extend({
	 *     init: function(first, last) {
	 *         this.first = first;
	 *         this.last  = last;
	 *     }
	 * });
	 *
	 * var justin = new Person("Justin", "Meyer");
	 * justin.first; // "Justin"
	 * justin.last; // "Meyer"
	 * ```
	 *
	 * Then we'll extend Person into Programmer and add a favorite language:
	 *
	 * ```
	 * var Programmer = Person.extend({
	 *     init: function(first, last, language) {
	 *         // call base's init
	 *         Person.prototype.init.apply(this, arguments);
	 *
	 *         // other initialization code
	 *         this.language = language;
	 *     },
	 *     bio: function() {
	 *         return "Hi! I'm "" + this.first + " " + this.last +
	 *             " and I write " + this.language + ".";
	 *     }
	 * });
	 *
	 * var brian = new Programmer("Brian", "Moschel", 'ECMAScript');
	 * brian.bio(); // "Hi! I'm Brian Moschel and I write ECMAScript.";
	 * ```
	 *
	 * ## Modified Arguments
	 *
	 * [can.Construct::setup] is able to modify the arguments passed to `init`.
	 * If you aren't receiving the exact arguments as those passed to `new Construct(args)`,
	 * check to make sure that they aren't being changed by `setup` somewhere along
	 * the inheritance chain.
	 */
	can.Construct.prototype.init = function () {};
	return can.Construct;
});

