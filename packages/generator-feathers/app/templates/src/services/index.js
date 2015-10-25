import todos from './todos';

export default function() {
  return function() {
    this.use('/todos', todos);
  };
}
