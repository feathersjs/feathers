# Uberproto

Uberproto is a simple base object that adds some sugar to ECMAScript 5 style object inheritance
in JavaScript.

Here is what it can do in a nutshell:

- Easily extend objects
- Initialization methods
- Super methods
- Mixins
- Method proxies

With a small footprint (about 1Kb minified) and an easy to handle API of just
four methods it also doesn't add a lot of baggage to your JavaScript application.

## Usage

UberProto can be used as a [CommonJS AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) module
(e.g. with [RequireJS](http://requirejs.org/)), [NodeJS](http://nodejs.org) or directly
in the browser. If no module loader is available, the global variable _Proto_
will be defined after you include the script. In the browser you have two options:
The default build that includes EcmaScript 5 shims or, if you only support modern browsers or
provide the shims already, without.

### Using AMD (e.g. RequireJS)

Make sure proto.js is in the right folder and then just define a module like this:

```javascript
define(['proto'], function(Proto) {
	// Source goes here
});
```

### In the browser

[Download proto.min.js](https://raw.github.com/daffl/uberproto/master/dist/proto.min.js) or
the EcmaScript 5 version [proto.es5.min.js](https://raw.github.com/daffl/uberproto/master/dist/proto.es5.min.js).
You can also `bower install uberproto` if you are using [Bower](http://twitter.github.com/bower/)
as your package manager. Then simply include the file as a script:

```html
<script type="text/javascript" src="proto.min.js"></script>
```

Now *Proto* is available as a global vairable.

### With NodeJS

After installing the package using NPM

> npm install uberproto

just require it like any other module:

```javascript
var Proto = require('uberproto');
```

## Creating objects

### Extend

You can extend any UberProto object by using *extend* to create a new object that inherits from the current one.
Internally [Object.create](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/create) is
being used (the library provides a polyfill for browsers that don't support Object.create)
and the prototype is set to the object that you are extending.
If defined, the *init* method will be used as the constructor.
That way you can define a simple Person object (which will be reused throughout the next paragraphs):

```javascript
var Person = Proto.extend({
	init : function(name) {
		this.name = name;
	},
	
	fullName : function() {
		return this.name;
	}
});
```

You can also define a plain object and pass it to UberProto object methods:

```javascript
var PersonObject = {
	init : function(name) {
		this.name = name;
	},

	fullName : function() {
		return this.name;
	}
};
```

Play around with the examples in [this JSFiddle](http://jsfiddle.net/Daff/2GB8n/1/).

### Initialize

You can create a new instance by calling *create*. This will create a new object and call the *init* method,
if defined:

```javascript
var dave = Person.create('Dave');
console.log(dave.name); // -> 'Dave'
console.log(dave.fullName()); // -> 'Dave'
```

If you are using *init* already for something else you can also set the *__init* property to the method name
of your intialization method:

```javascript
var MyPerson = Proto.extend({
	__init : 'construct',

	construct : function(name) {
		this.name = name;
	}
});
```

For calling the constructor on a plain object, call *create* on an UberProto object:

```javascript
var john = Proto.create.call(PersonObject, 'John');
console.log(john.fullName()); // -> 'John'
```

Overwriting *create* is great if you want to customize the way new objects are being
instantiated.

### Super methods
	
In each method `this._super` refers to the method being overwritten, if there is one.
For our Person object, for example, it would be a lot better if it also had a last name:

```javascript
var BetterPerson = Person.extend({
	init : function(name, lastname) {
		// If you want to pass all original arguments to the
		// _super method just use apply:
		// this._super.apply(this, arguments);		
		this._super(name);
		this.lastname = lastname;
	},
	
	fullName : function() {
		return this._super() + ' ' + this.lastname;
	}
});

var dave = BetterPerson.create('Dave', 'Doe');
console.log(dave.name); // -> 'Dave'
console.log(dave.lastname); // -> 'Doe'
console.log(dave.fullName()); // -> 'Dave Doe'
```

You can also extend a plain object if you don't want to inherit from an UberProto object:

```javascript
var BetterPersonObject = Proto.extend({
	init : function(name, lastname) {
		this._super(name);
		this.lastname = lastname;
	},

	fullName : function() {
		return this._super() + ' ' + this.lastname;
	}
}, PersonObject); // Pass the plain object as the second parameter
```

### Mixins

Mixins add functionality to an existing object. Mixins can also access their super methods using `this._super`.
This will either refer the overwritten method on the object itself or the one on the prototype:

```javascript
Person.mixin({
	init : function()
	{
		this._super.apply(this, arguments);
		this.can_sing = true;
	},
	
	sing : function()
	{
		return 'Laaaa';
	}
});

var dude = Person.create('Dude');
console.log(dude.sing()); // -> 'Laaaa'
console.log(dude.can_sing); // -> true
```

Actual instances can be mixed in just the same:

```javascript
var operaSinger = Person.create('Pavarotti');
operaSinger.mixin({
	sing : function()
	{
		return this._super() + ' Laalaaa!';
	}
});

console.log(operaSinger.sing()); // -> 'Laaaa Laalaaa!'
```

And you can also mix into plain objects e.g. overwriting the constructor of PersonObject:

```javascript
Proto.mixin({
	fullName : function() {
		return 'My name is: ' + this._super();
	}
}, PersonObject);

// Create a plain object without calling the constructor
var instance = Object.create(PersonObject);
instance.name = 'Dude';
console.log(instance.fullName()); // 'My name is: Dude'
```

### Method proxy

You can create proxy callbacks, that make sure that _this_ will always
point to the right object:

```javascript	
var callback = operaSinger.proxy('fullName');
console.log(callback()); // -> 'Pavarotti'
```

And you can partially apply function arguments:

```javascript
operaSinger.mixin({
	sing : function(text)
	{
		return this._super() + ' ' + text;
	}
});

var singHello = operaSinger.proxy('sing', 'Helloooooo!');

singHello() // Laaaa Laalaaa! Helloooooo!
```

`proxy` only works on objects extended from UberProto.

## Changelog

__1.1.1__

* Updating component and bower ([#6](https://github.com/daffl/uberproto/pull/6))
* Only wrap functions that are actually calling ._super ([#7](https://github.com/daffl/uberproto/pull/7))
* Improved build and tests

__1.1.0__

* Extract ES5 shims (build shim-less version)
* Use Function.bind for proxy
* Switched test suite to [Mocha](http://visionmedia.github.com/mocha/)
* [GruntJS](http://gruntjs.com/) build
* [Bower](http://twitter.github.com/bower/) component: `bower install uberproto`

__1.0.3__

* Added `Object.getPrototypeOf` shim
* Updated documentation
* Added Travis CI

__1.0.2__

* Added `__init` property to allow constructor functions to be named other than *init*. Fixes issue [#1](https://github.com/daffl/uberproto/pull/1)

__1.0.1__

* API now usable with plain objects like `Proto.mixin({}, PlainObject)`

__1.0.0__

* Initial stable release

## License

Copyright (C) 2013 David Luecke daff@neyeon.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

[![Build Status](https://secure.travis-ci.org/daffl/uberproto.png)](http://travis-ci.org/daffl/uberproto)
