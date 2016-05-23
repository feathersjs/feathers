import feathers from 'feathers';
import primus from '../src';
import memory from 'feathers-memory';

function todoService() {
  return memory().extend({
    get: function(id, params, callback) {
      if(params.query.error) {
        return callback(new Error('Something went wrong'));
      }

      return this._super(id, params).then(
        data => Object.assign({ query: params.query }, data)
      );
    }
  });
}

export default function(callback) {
  const options = {
    transformer: 'websockets'
  };
  const app = feathers().configure(primus(options, primus => callback(primus)));
  const v1 = feathers().configure(primus(options)).use('/todos', todoService());
  const v2 = feathers().configure(primus(options)).use('/todos', todoService());

  app.use('/api/v1', v1);
  app.use('/api/v2', v2);

  v1.service('todos').create({ text: 'some todo', complete: false }, {}, function() {});
  v2.service('todos').create({ text: 'some todo', complete: false }, {}, function() {});

  return app;
}
