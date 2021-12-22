import assert from 'assert';

export default {
  prompt: ({ prompter, config }: any) => {
    assert.ok(config)

    return prompter.prompt()
  },
  rendered: (result: any, config: any) => {
    assert.ok(result.actions)
    assert.ok(config.templates)
  }
}
