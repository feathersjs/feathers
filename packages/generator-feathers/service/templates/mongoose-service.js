import hooks from '../hooks';
import service from 'feathers-mongoose';
import <%= name %> from '../models/<%= name %>';

export default function(){
  const app = this;

  let options = {
    Model: <%= name %>,
    paginate: {
      default: 5,
      max: 25
    }
  };

  app.use('/<%= pluralizedName %>', service(options));
}
