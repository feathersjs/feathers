---
to: <%= h.lib %>/services/index.js
inject: true
skip_if: "app.configure\\(<%= configureFunction %>\\)"
after: "export default app"
---
  app.configure(<%= configureFunction %>);