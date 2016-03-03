export default function() {
  const mixins = [
    require('./normalizer'),
    require('./event'),
    require('./promise')
  ];
  
  return mixins;
}
