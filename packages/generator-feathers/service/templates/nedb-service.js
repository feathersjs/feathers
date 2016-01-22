import { join } from 'path';
import hooks from '../hooks';
import NeDB from 'nedb';
import service from 'feathers-nedb';


export default function(){
  const app = this;

  const db = new NeDB({
    filename: join(app.get('nedb'), '<%= pluralizedName %>.db'),
    autoload: true
  });

  let options = {
    Model: db,
    paginate: {
      default: 5,
      max: 25
    }
  };

  app.use('/<%= pluralizedName %>', service(options));
}
