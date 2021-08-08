---
to: "<%= h.lib %>/hooks/<%= name %>.js"
---
export const <%= h._.camelCase(name) %> = async (context, next) => {
  // Do things before
  await next();
  // Do things after
}
