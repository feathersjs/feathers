---
to: package.json
sh: cd <%= cwd %>; feathers generate app <%= language %>
---
<%
  // Our package.json as a JavaScript object using the
  // global template variables
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
      node: '>= 14.0.0'
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
      test: 'test/'
    },
    main: `${lib}/`
  }
%><%- JSON.stringify(pkg, null, '  ') %>
