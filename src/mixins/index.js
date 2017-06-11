export default function () {
  const mixins = [
    require('./promise'),
    require('./event'),
    require('../hooks'),
    require('./normalizer')
  ];

  // Override push to make sure that normalize is always the last
  mixins.push = function () {
    const args = [this.length - 1, 0].concat(Array.from(arguments));
    this.splice.apply(this, args);
    return this.length;
  };

  return mixins;
}
