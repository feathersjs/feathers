module.exports = {
  async prompt ({ prompter, args }) {
    return prompter.prompt([{
      type: 'input',
      name: 'name',
      message: 'What is the name of hook?',
      skip: !!args.name,
      default: args.name
    }]);
  }
}
