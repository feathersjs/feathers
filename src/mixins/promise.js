function isPromise (result) {
  return typeof result !== 'undefined' &&
      typeof result.then === 'function';
}

function wrapper () {
  const result = this._super.apply(this, arguments);
  const callback = arguments[arguments.length - 1];

  if (typeof callback === 'function' && isPromise(result)) {
    result.then(data => callback(null, data), error => callback(error));
  }
  return result;
}

export default function (service) {
  if (typeof service.mixin === 'function') {
    const mixin = {};

    this.methods.forEach(method => {
      if (typeof service[method] === 'function') {
        mixin[method] = wrapper;
      }
    });

    service.mixin(mixin);
  }
}
