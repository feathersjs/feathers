import path from 'path'
import { Logger } from '../logger'
import { engine } from '../index'
import { jest, expect } from '@jest/globals'
import enquirer from 'enquirer';
import execa from 'execa';

jest.mock('enquirer', () => ({
  prompt: null
}))

const logger = new Logger(() => ({}))

const createConfig = (metaDir: string) => ({
  templates: path.join(metaDir, 'fixtures'),
  cwd: metaDir,
  exec: (action: any, body: any) => {
    const execOpts = body && body.length > 0 ? { input: body } : {}
    return execa.command(action, { ...execOpts, shell: true })
  },
  logger,
  createPrompter: () => require('enquirer')
})

const failPrompt = () => {
  throw new Error('set up prompt in testing')
}

describe('engine embedding', () => {
  beforeEach(() => {
    enquirer.prompt = failPrompt
  })

  it('renders with runner arguments and runs hook module', async () => {
    const promptResult = {
      email: 'hello@test.com'
    }
    // @ts-ignore
    enquirer.prompt = () => Promise.resolve(promptResult)

    const config = createConfig(__dirname)

    const result = await engine(
      {
        generator: 'hookmodule',
        action: 'new',
        args: {
          name: 'Dave',
          greeting: 'Hi'
        }
      },
      config
    )

    expect(result.actions.length).toBe(0)
    expect(result.args.email).toBe(promptResult.email)
    expect(result.args.name).toBe('Dave')
    expect(result.hookModule).toBeDefined()
  })
})