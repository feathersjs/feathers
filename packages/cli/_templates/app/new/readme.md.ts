import { join } from 'path'
import { VariablesApp } from '.'
import { GeneratorContext, RenderResult } from '../../../src'

export function render (context: GeneratorContext<VariablesApp>): RenderResult {
  const to = join('readme.md')
  const body = `
# ${context.name}

> ${context.description}

## About

This project uses [Feathers](http://feathersjs.com). An open source web framework for building APIs and real-time applications.

## Getting Started

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install your dependencies

    \`\`\`
    cd path/to/${context.name}
    npm install
    \`\`\`

3. Start your app

    \`\`\`
    npm start
    \`\`\`

## Testing

Run \`npm test\` and all your tests in the \`test/\` directory will be run.

## Scaffolding

Feathers has a powerful command line interface. Here are a few things it can do:

\`\`\`
$ npm install -g @feathersjs/cli          # Install Feathers CLI

$ feathers generate service               # Generate a new Service
$ feathers generate hook                  # Generate a new Hook
$ feathers help                           # Show all commands
\`\`\`

## Help

For more information on all the things you can do with Feathers visit [docs.feathersjs.com](http://docs.feathersjs.com).
`

return { 
body, 
to
}
}