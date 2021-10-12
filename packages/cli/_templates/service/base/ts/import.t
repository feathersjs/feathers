---
to: "<%= h.lib %>/services/index.ts"
inject: true
prepend: true
skip_if: "import { <%= camelName %> }"
---
import { <%= camelName %> } from './<%= path %>';
