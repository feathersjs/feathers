(function () {
	Object.create = Object.create || function (o) {
		if (arguments.length > 1) {
			throw new Error('Object.create implementation only accepts the first parameter.');
		}
		function F() {
		}

		F.prototype = o;
		return new F();
	};

	Object.getPrototypeOf = Object.getPrototypeOf || function (object) {
		return object.proto || object.constructor.prototype;
	};

	Function.prototype.bind = Function.prototype.bind || function (oThis) {
		if (typeof this !== "function") {
			// closest thing possible to the ECMAScript 5 internal IsCallable function
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}

		var aArgs = Array.prototype.slice.call(arguments, 1),
			fToBind = this,
			FNOP = function () {
			},
			fBound = function () {
				return fToBind.apply(this instanceof FNOP && oThis ? this : oThis,
					aArgs.concat(Array.prototype.slice.call(arguments)));
			};

		FNOP.prototype = this.prototype;
		fBound.prototype = new FNOP();

		return fBound;
	};
})();
