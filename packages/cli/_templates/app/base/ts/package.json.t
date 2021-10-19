---
to: "package.json"
force: true
---
<%

// This extends the content of the existing package.json
const pkg = {
  ...h.pkg,
  scripts: {
    ...h.pkg.scripts,
    dev: 'nodemon -x ts-node ${h.lib}/index.ts',
    compile: 'shx rm -rf lib/ && tsc',
    start: 'npm run compile && node lib/',
    test: 'mocha test/ --require ts-node/register --recursive --extension .ts --exit'
  }
};

%><%- JSON.stringify(pkg, null, '  ') %>
