import { PromptOptions } from "../../../src";

export type VariablesHook = {
  name: string
}

export default {
  async prompt ({ prompter, args }: PromptOptions) {
    return prompter.prompt([{
      type: 'input',
      name: 'name',
      message: 'What is the name of hook?',
      skip: !!args.name,
      default: args.name
    }]);
  }
}
