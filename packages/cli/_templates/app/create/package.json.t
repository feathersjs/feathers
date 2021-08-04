---
to: "package.json"
---
<%
  // Our package.json as a JavaScript object using the
  // global template variables from the prompts in `index.js`
  const pkg = {
    name,
    description,
    version: '0.0.0',
    homepage: '',
    private: true,
    keywords: [ 'feathers' ],
    author: {},
    contributors: [],
    bugs: {},
    engines: {
      node: '>= ' + process.version.substring(1)
    },
    feathers: {
      language,
      packager,
      database,
      tester,
      framework,
      transports
    },
    directories: {
      lib,
      test: 'test'
    },
    main: `${lib}/`
  }
%><%- JSON.stringify(pkg, null, '  ') %>
