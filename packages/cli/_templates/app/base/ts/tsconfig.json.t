---
to: "tsconfig.json"
---
{
  "compilerOptions": {
    "target": "es2018",
    "module": "commonjs",
    "outDir": "./lib",
    "rootDir": "./<%= h.lib %>",
    "strict": true,
    "esModuleInterop": true
  },
  "exclude": [
    "test"
  ]
}