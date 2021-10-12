---
to: "<%= h.lib %>/services/index.ts"
inject: true
skip_if: "app.configure\\(<%= camelName %>\\)"
after: "export default"
---
  app.configure(<%= camelName %>);