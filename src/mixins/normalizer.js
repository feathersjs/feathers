import { getArguments } from 'feathers-commons';

export default function (service) {
  if (typeof service.mixin === 'function') {
    const mixin = {};

    this.methods.forEach(method => {
      if(typeof service[method] === 'function') {
        mixin[method] = function() {
          return this._super.apply(this, getArguments(method, arguments));
        };
      }
    });

    service.mixin(mixin);
  }
}
