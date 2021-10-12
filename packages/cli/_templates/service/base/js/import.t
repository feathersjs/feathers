---
to: "<%= h.lib %>/services/index.js"
inject: true
prepend: true
skip_if: "import { <%= camelName %> }"
---
import { <%= camelName %> } from './<%= path %>.js';
