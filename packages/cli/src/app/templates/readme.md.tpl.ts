import { generator, renderTemplate, toFile } from '@feathershq/pinion'
import { AppGeneratorContext } from '../index'

const template = ({ name, description }: AppGeneratorContext) =>
  `# ${name}

> ${description}

## About

This project uses [Feathers](http://feathersjs.com). An open source framework for building APIs and real-time applications.

## Getting Started

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install your dependencies

    \`\`\`
    cd path/to/${name}
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
$ feathers help                           # Show all commands
\`\`\`

## Help

For more information on all the things you can do with Feathers visit [docs.feathersjs.com](http://docs.feathersjs.com).
`

export const generate = (ctx: AppGeneratorContext) =>
  generator(ctx).then(renderTemplate(template, toFile('readme.md')))
