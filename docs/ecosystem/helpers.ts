export function nFormatter(num: number, digits?: number) {
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' }
  ]
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
  const item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value
    })
  return item ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : '0'
}

export const uniqBy = <T = any, V = any>(arr: T[], selector: (item: T) => V) => {
  const map = new Map<V, T>()
  arr.forEach((item) => {
    const prop = selector(item)
    if (!map.has(prop)) map.set(prop, item)
  })
  return [...map.values()]
}
