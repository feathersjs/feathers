# <%= appname %> [![Build Status](https://travis-ci.org/<%= githubUser %>/<%= _.slugify(appname) %>.png?branch=master)](https://travis-ci.org/<%= githubUser %>/<%= _.slugify(appname) %>)

> <%= pluginDescription %>

## Getting Started

To install <%= appname %> from [npm](https://www.npmjs.org/), run:

```bash
$ npm install <%= _.slugify(appname) %> --save
```

Finally, to use the plugin in your Feathers app:

```javascript
// Require
var feathers = require('feathers');
var plugin = require('<%= _.slugify(appname) %>');
// Setup
var app = feathers();
// Use Plugin
app.configure(plugin({ /* configuration */ }));
```

## Documentation

See the [docs](docs/).

## Author

- [<%= realname %>](<%= githubUrl %>)

## License

Copyright (c) <%= currentYear %> <%= realname %>
Licensed under the [MIT license](LICENSE).