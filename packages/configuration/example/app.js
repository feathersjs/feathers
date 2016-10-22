import feathers from 'feathers';
import configuration from '../src';

let conf = configuration();

let app = feathers()
  .configure(conf);

console.log(app.get('frontend'));
console.log(app.get('host'));
console.log(app.get('port'));
console.log(app.get('mongodb'));
console.log(app.get('templates'));
console.log(conf());
