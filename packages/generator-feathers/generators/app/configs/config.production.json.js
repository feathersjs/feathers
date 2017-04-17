module.exports = function(generator) {
  const { props } = generator;
  const config = {
    host: `${props.name}-app.feathersjs.com`,
    port: `PORT`
  };

  return config;
};
