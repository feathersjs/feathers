#!/usr/bin/env node
'use strict';

import path from 'path'
import { existsSync } from 'fs'
import { mkdir } from 'fs/promises'
import { Command, commandRunner, chalk } from '@feathersjs/cli'

const program = new Command()
const generateApp = commandRunner('app')

program
  .name('npm init feathers')
  .description(`Create a new Feathers application 🕊️

${chalk.grey('npm init feathers myapp')}
`)
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

      await generateApp({
        name,
        cwd,
        ...options
      })

      console.log(`

${chalk.green('Hooray')}! Your Feathers app is ready to go! 🚀
Go to the ${chalk.grey(name)} folder to get started.

To learn more visit ${chalk.grey('https://feathersjs.com/guides')}
`)
    } catch (error) {
      console.error(`${chalk.red('Error')}: ${error.message}`)
      process.exit(1)
    }
  })

program.parse()
