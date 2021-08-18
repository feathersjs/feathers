module.exports = {
  async prompt ({ config }) {
    const { database } = config.helpers.feathers;

    await config.helpers.generate({
      generator: database,
      action: 'service'
    }, config);
  }
}
