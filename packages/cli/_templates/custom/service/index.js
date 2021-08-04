module.exports = {
  async prompt ({ config, args }) {
    const { helpers } = config;
    const result = await helpers.generate({
      generator: 'service',
      action: 'base',
      args
    });

    return result.args;
  }
}
