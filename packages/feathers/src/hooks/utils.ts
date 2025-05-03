export function copyProperties<F>(target: F, ...originals: any[]) {
  for (const original of originals) {
    const originalProps = (Object.keys(original) as any).concat(Object.getOwnPropertySymbols(original))

    for (const prop of originalProps) {
      const propDescriptor = Object.getOwnPropertyDescriptor(original, prop)

      if (propDescriptor && !Object.prototype.hasOwnProperty.call(target, prop)) {
        Object.defineProperty(target, prop, propDescriptor)
      }
    }
  }

  return target
}

export function copyFnProperties<F>(target: F, original: any) {
  const internalProps = ['name', 'length']

  try {
    for (const prop of internalProps) {
      const value = original[prop]

      Object.defineProperty(target, prop, { value })
    }
  } catch (_e) {
    // Avoid IE error
  }

  return target
}
