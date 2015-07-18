/* global describe, it, window, require */
(function () {
	var Proto, test;

	if (typeof require === 'function') {
		Proto = require('../lib/proto');
		test = require('assert');
	} else {
		Proto = window.Proto;
		test = window.assert;
	}

	describe('UberProto', function () {
		it('extends objects', function () {
			var Extended = Proto.extend({
				sayHi: function () {
					test.ok(true, 'sayHi called');
					return 'hi';
				}
			});

			test.equal(Extended.create().sayHi(), "hi", "Said hi");
		});

		it('creates a new object', function () {
			var Obj = Proto.extend({
				init: function (name) {
					test.ok(true, 'Init called');
					this.name = name;
				},

				sayHi: function () {
					return 'Hi ' + this.name;
				},

				prop: 'Testing'
			});

			var inst = Obj.create('Tester');
			test.equal(inst.name, 'Tester', 'Name set');
			test.equal(inst.prop, 'Testing', 'Prototype property still there');
			test.equal(inst.sayHi(), 'Hi Tester', 'Said hi with name');
			test.ok(Proto.isPrototypeOf(Obj), 'Should have prototype of Proto');
			test.ok(Obj.isPrototypeOf(inst), 'Instance should have prototype of Obj');
		});

		it('uses an init method alias', function () {
			var Obj = Proto.extend({
					__init: 'myConstructor',
					myConstructor: function (arg) {
						test.equal(arg, 'myConstructor', 'Got proper arguments in myConstructor');
					}
				}),
				OtherObj = {
					__init: 'testConstructor',
					testConstructor: function (arg) {
						test.equal(arg, 'testConstructor', 'Got proper arguments in myConstructor');
					}
				};

			Obj.create('myConstructor');
			Proto.create.call(OtherObj, 'testConstructor');
		});

		it('uses _super', function () {
			var Obj = Proto.extend({
				init: function (name) {
					test.ok(true, 'Super init called');
					this.name = name;
				}
			}), Sub = Obj.extend({
				init: function () {
					this._super.apply(this, arguments);
					test.ok(true, 'Sub init called');
				}
			});

			var inst = Sub.create('Tester');
			test.equal(inst.name, 'Tester', 'Name set in prototype');
		});

		it('extends an existing object', function () {
			var Obj = {
				test: function (name) {
					test.ok(true, 'Super test method called');
					this.name = name;
				}
			};

			var Extended = Proto.extend({
				test: function () {
					this._super.apply(this, arguments);
					test.ok(true, 'Sub init called');
				}
			}, Obj);

			Extended.test('Tester');

			test.equal(Extended.name, 'Tester', 'Name set in prototype');
		});

		it('uses .mixin', function () {
			var Obj = Proto.extend({
				init: function (name) {
					test.ok(true, 'Init called');
					this.name = name;
				}
			});

			Obj.mixin({
				test: function () {
					return this.name;
				}
			});

			var inst = Obj.create('Tester');
			test.equal(inst.test(), 'Tester', 'Mixin returned name');

			Obj.mixin({
				test: function () {
					return this._super() + ' mixed in';
				}
			});

			test.equal(inst.test(), 'Tester mixed in', 'Mixin called overwritten');
		});

		it('.mixin(Object)', function () {
			var Obj = {
				test: function (name) {
					test.ok(true, 'Super test method called');
					this.name = name;
				}
			};

			Proto.mixin({
				test: function () {
					this._super.apply(this, arguments);
					test.ok(true, 'Sub init called');
				}
			}, Obj);

			Obj.test('Tester');

			test.equal(Obj.name, 'Tester', 'Name set in prototype');
		});

		it('uses .proxy', function () {
			var Obj = Proto.extend({
				init: function (name) {
					this.name = name;
				},

				test: function (arg) {
					return this.name + ' ' + arg;
				}
			});

			var inst = Obj.create('Tester'),
				callback = inst.proxy('test');
			test.equal(callback('arg'), 'Tester arg', 'Callback set scope properly');

			callback = inst.proxy('test', 'partialed');
			test.equal(callback(), 'Tester partialed', 'Callback partially applied');
		});
	});
})();
