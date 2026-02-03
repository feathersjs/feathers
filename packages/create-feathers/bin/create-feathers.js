#!/usr/bin/env node
'use strict'

import path from 'node:path'
import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { Command } from 'commander'
import { generate, getContext } from '../lib/index.js'

const color = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  grey: (text) => `\x1b[90m${text}\x1b[0m`
}

const program = new Command()

program
  .name('npm create feathers')
  .description(
    `Create a new Feathers application 🕊️

${color.grey('npm create feathers myapp')}
`
  )
  .argument('<name>', 'The name of your new application')
  // .version(version)
  .showHelpAfterError()
  .action(async (name, options) => {
    try {
      const cwd = path.join(process.cwd(), name)

      if (existsSync(cwd)) {
        throw new Error(`Can not create Feathers application, the folder "${name}" already exists`)
      }

      await mkdir(cwd)

      const ctx = getContext({
        name,
        cwd,
        ...options
      })

      await generate(ctx)

      console.log(`

${color.green('Hooray')}! Your Feathers app is ready to go! 🚀
Go to the ${color.grey(name)} folder to get started.

To learn more visit ${color.grey('https://feathersjs.com/guides')}
`)
    } catch (error) {
      console.error(`${color.red('Error')}: ${error.message}`)
      process.exit(1)
    }
  })

program.parse()
