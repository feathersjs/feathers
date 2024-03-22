import path from 'path'
import pkg from '../package.json'
import { DependencyVersions } from '../src/commons'
import { readFileSync } from 'fs'

// Set __dirname in es module
const __dirname = path.dirname(new URL(import.meta.url).pathname)

export function combinate<O extends Record<string | number, any[]>>(obj: O) {
  let combos: { [k in keyof O]: O[k][number] }[] = []
  for (const key of Object.keys(obj)) {
    const values = obj[key]
    const all: any[] = []
    for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < (combos.length || 1); j++) {
        const newCombo = { ...combos[j], [key]: values[i] }
        all.push(newCombo)
      }
    }
    combos = all
  }
  return combos
}

export const dependencyVersions = Object.keys(pkg.devDependencies as any)
  .filter((dep) => dep.startsWith('@feathersjs/'))
  .reduce((acc, dep) => {
    const [, name] = dep.split('/')
    const { version } = JSON.parse(
      readFileSync(path.join(__dirname, '..', '..', name, 'package.json'), 'utf8').toString()
    )

    acc[dep] = path.join(__dirname, 'build', `feathersjs-${name}-${version}.tgz`)

    return acc
  }, {} as DependencyVersions)
