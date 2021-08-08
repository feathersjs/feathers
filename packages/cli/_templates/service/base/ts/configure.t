---
to: "<%= h.lib %>/services/index.ts"
inject: true
skip_if: "app.configure\\(<%= configureFunction %>\\)"
after: "export default"
---
  app.configure(<%= configureFunction %>);