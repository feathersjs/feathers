# Contributing to Feathers

Thank you for contributing to Feathers!

## Report a bug

Issues can be reported in the [issue tracker](https://github.com/feathersjs/feathers/issues) or the [Gitter chat](https://gitter.im/feathersjs/feathers).

If you have any other questions, feel free to submit post them on [Stackoverflow](http://stackoverflow.com) using the `feathers` or `feathersjs` tag or join [#feathersjs](http://webchat.freenode.net/?channels=feathersjs) on Freenode IRC.

## Code style

Before running the tests from the `test/` folder `npm test` will run JSHint. You can check your code changes individually by running `npm run jshint`.

## ES6 compilation

Feathers uses [Babel](https://babeljs.io/) to leverage the latest developments of the JavaScript language. All code and samples are currently written in ES2015. To transpile the code in this repository run

> npm run compile

__Note:__ `npm test` will run the compilation automatically before the tests.

## Tests

[Mocha](http://mochajs.org/) tests are located in the `test/` folder and can be run using the `npm run mocha` or `npm test` (with JSHint) command.

## Documentation

Feathers documentation is contained Markdown files in the `/docs` folder. To change the documentation submit a pull request and it will be updated with the next release.

# Contributor Code of Conduct

As contributors and maintainers of this project, we pledge to respect all people who contribute through reporting issues, posting feature requests, updating documentation, submitting pull requests or patches, and other activities.

We are committed to making participation in this project a harassment-free experience for everyone, regardless of level of experience, gender, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, or religion.

Examples of unacceptable behavior by participants include the use of sexual language or imagery, derogatory comments or personal attacks, trolling, public or private harassment, insults, or other unprofessional conduct.

Project maintainers have the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned to this Code of Conduct. Project maintainers who do not follow the Code of Conduct may be removed from the project team.

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by opening an issue or contacting one or more of the project maintainers.

This Code of Conduct is adapted from the [Contributor Covenant](http://contributor-covenant.org), version 1.0.0, available at [http://contributor-covenant.org/version/1/0/0/](http://contributor-covenant.org/version/1/0/0/)
