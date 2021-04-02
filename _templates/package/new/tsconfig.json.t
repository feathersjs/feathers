---
to: packages/<%= name %>/tsconfig.json
---

{
  "extends": "../../tsconfig",
  "include": [
    "src/**/*.ts"
  ],
  "compilerOptions": {
    "outDir": "lib"    
  }
}
