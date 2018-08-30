# Contributing to Feathers

Thank you for contributing to Feathers! :heart: :tada:

This repo is the main core and where most issues are reported. Feathers embraces modularity and is broken up across many repos.

## Report a bug

Before creating an issue please make sure you have checked out the docs, specifically the [FAQ](https://docs.feathersjs.com/help/faq.html) section. You might want to also try searching Github. It's pretty likely someone has already asked a similar question.

If you haven't found your answer please feel free to join our [slack channel](http://slack.feathersjs.com), create an issue on Github, or post on [Stackoverflow](http://stackoverflow.com) using the `feathers` or `feathersjs` tag. We try our best to monitor Stackoverflow but you're likely to get more immediate responses in Slack and Github.

Issues can be reported in the [issue tracker](https://github.com/feathersjs/feathers/issues).  Since feathers combines many modules it can be hard for us to assess the root cause without knowing which modules are being used and what your configuration looks like, so **it helps us immensely if you can link to a simple example that reproduces your issue**.

## Report a Security Concern

We take security very seriously at Feathers. We welcome any peer review of our 100% open source code to ensure nobody's Feathers app is ever compromised or hacked. As a web application developer you are responsible for any security breaches. We do our very best to make sure Feathers is as secure as possible by default.

In order to give the community time to respond and upgrade we strongly urge you report all security issues to us. Send one of the core team members a PM in [Slack](http://slack.feathersjs.com) or email us at hello@feathersjs.com with details and we will respond ASAP.

For full details refer to our [Security docs](https://docs.feathersjs.com/SECURITY.html).

## Pull Requests

We :heart: pull requests and we're continually working to make it as easy as possible for people to contribute, including a [Plugin Generator](https://github.com/feathersjs/generator-feathers-plugin) and a [common test suite](https://github.com/feathersjs/feathers-service-tests) for database adapters.

We prefer small pull requests with minimal code changes. The smaller they are the easier they are to review and merge. A core team member will pick up your PR and review it as soon as they can. They may ask for changes or reject your pull request. This is not a reflection of you as an engineer or a person. Please accept feedback graciously as we will also try to be sensitive when providing it.

Although we generally accept many PRs they can be rejected for many reasons. We will be as transparent as possible but it may simply be that you do not have the same context or information regarding the roadmap that the core team members have. We value the time you take to put together any contributions so we pledge to always be respectful of that time and will try to be as open as possible so that you don't waste it. :smile:

**All PRs (except documentation) should be accompanied with tests and pass the linting rules.**

### Code style

Before running the tests from the `test/` folder `npm test` will run ESlint. You can check your code changes individually by running `npm run lint`.

### Tests

[Mocha](http://mochajs.org/) tests are located in the `test/` folder and can be run using the `npm run mocha` or `npm test` (with ESLint and code coverage) command.

## External Modules

If you're written something awesome for Feathers, the Feathers ecosystem, or using Feathers please add it to the [awesome-feathersjs](https://github.com/feathersjs/awesome-feathersjs) repository.

If you think it would be a good core module then please contact one of the Feathers core team members in [Slack](http://slack.feathersjs.com) and we can discuss whether it belongs in core and how to get it there. :beers:

## Contributor Code of Conduct

As contributors and maintainers of this project, we pledge to respect all people who contribute through reporting issues, posting feature requests, updating documentation, submitting pull requests or patches, and other activities.

We are committed to making participation in this project a harassment-free experience for everyone, regardless of level of experience, gender, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, or religion.

Examples of unacceptable behavior by participants include the use of sexual language or imagery, derogatory comments or personal attacks, trolling, public or private harassment, insults, or other unprofessional conduct.

Project maintainers have the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned to this Code of Conduct. Project maintainers who do not follow the Code of Conduct may be removed from the project team.

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by opening an issue or contacting one or more of the project maintainers.

This Code of Conduct is adapted from the [Contributor Covenant](http://contributor-covenant.org), version 1.0.0, available at [http://contributor-covenant.org/version/1/0/0/](http://contributor-covenant.org/version/1/0/0/)
