import hooks from '../hooks';
import service from 'feathers-memory';

export default function(){
  const app = this;

  let options = {
    paginate: {
      default: 5,
      max: 25
    }
  };

  app.use(<% if (version) { %>'/<%= version %>/<%= pluralizedName %>'<% } else { %>'/<%= pluralizedName %>'<% } %>, service(options));
}