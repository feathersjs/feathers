---
to: <%= h.lib %>/services/index.js
inject: true
prepend: true
skip_if: "import { <%= configureFunction %> }"
---
import { <%= configureFunction %> } from './<%= path %>.js';