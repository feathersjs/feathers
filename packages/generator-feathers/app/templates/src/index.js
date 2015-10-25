import feathers from 'feathers';

const app = feathers()
  .configure(services())
  .configura(hooks());
