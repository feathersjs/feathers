---
to: "<%= h.lib %>/services/index.ts"
inject: true
prepend: true
skip_if: "import { <%= configureFunction %> }"
---
import { <%= configureFunction %> } from './<%= path %>';
