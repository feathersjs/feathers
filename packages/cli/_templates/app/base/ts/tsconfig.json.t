---
to: "tsconfig.json"
---
{
  "ts-node": {
    "files": true
  },
  "compilerOptions": {
    "target": "es2020",
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
