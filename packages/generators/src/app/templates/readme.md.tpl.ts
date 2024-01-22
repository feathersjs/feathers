import { renderTemplate, toFile } from '@featherscloud/pinion'
import { AppGeneratorContext } from '../index.js'

const template = ({ name, description, language, database }: AppGeneratorContext) => /* md */ `# ${name}

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

    \`\`\`${
      language === 'ts'
        ? `
    npm run compile # Compile TypeScript source`
        : ''
    }${
      database !== 'mongodb'
        ? `
    npm run migrate # Run migrations to set up the database`
        : ''
    }
    npm start
    \`\`\`

## Testing

Run \`npm test\` and all your tests in the \`test/\` directory will be run.

## Scaffolding

This app comes with a powerful command line interface for Feathers. Here are a few things it can do:

\`\`\`
$ npx feathers help                           # Show all commands
$ npx feathers generate service               # Generate a new Service
\`\`\`

## Help

For more information on all the things you can do with Feathers visit [docs.feathersjs.com](http://docs.feathersjs.com).
`

export const generate = (ctx: AppGeneratorContext) =>
  Promise.resolve(ctx).then(renderTemplate(template, toFile('readme.md')))
