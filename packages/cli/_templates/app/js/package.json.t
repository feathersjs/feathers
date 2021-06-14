---
to: package.json
force: true
sh: "<%= h.install(...dependencies) %>; <%= h.installDev(...devDependencies) %>"
---
<%

// This extends the content of the existing package.json
const pkg = {
  ...h.pkg,
  type: 'module',
  scripts: {
    start: `node ${h.lib}/`,
    dev: `nodemon ${h.lib}/`,
    test: h.feathers.tester === 'mocha' ? 'mocha test/ --recursive --exit' : 'jest  --forceExit'
  }
};

%><%- JSON.stringify(pkg, null, '  ') %>
