import path from 'path'
import pkg from '../package.json'
import { DependencyVersions } from '../src/commons'
import lernaConfig from '../../../lerna.json'

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

    acc[dep] = path.join(__dirname, `feathersjs-${name}-${lernaConfig.version}.tgz`)

    return acc
  }, {} as DependencyVersions)
