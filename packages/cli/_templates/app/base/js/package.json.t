---
to: "package.json"
force: true
---
<%

// This extends the content of the existing package.json
const pkg = {
  ...h.pkg,
  type: 'module',
  scripts: {
    ...h.scripts,
    start: `node ${h.lib}/`,
    dev: `nodemon ${h.lib}/`,
    test: 'mocha test/ --recursive --exit'
  }
};

%><%- JSON.stringify(pkg, null, '  ') %>
