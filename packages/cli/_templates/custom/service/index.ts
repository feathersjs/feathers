import { PromptOptions } from "../../../src";

export default {
  async prompt ({ config, args }: PromptOptions) {
    const { helpers } = config;
    const result = await helpers.generate({
      generator: 'service',
      action: 'base',
      args
    }, config);

    return result.args;
  }
}
