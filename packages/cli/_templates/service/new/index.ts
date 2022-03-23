import { PromptOptions } from "../../../src";

export default {
  async prompt ({ config }: PromptOptions) {
    const { database } = config.helpers.feathers;

    await config.helpers.generate({
      generator: database,
      action: 'service'
    }, config);
  }
}
