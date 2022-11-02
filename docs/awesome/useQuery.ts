import { computed, ref, WritableComputedRef } from 'vue'
import queryString from 'query-string'

type PossibleType = 'string' | 'number' | 'boolean' | 'string[]'

type InferType<T> = T extends 'string'
  ? string
  : T extends 'number'
  ? number
  : T extends 'boolean'
  ? boolean
  : T extends 'string[]'
  ? string[]
  : never

export const useQuery = <T extends PossibleType, V = InferType<T>>(
  field: string,
  type: T,
  defaultValue?: V
) => {
  function getQuery() {
    return queryString.parse(window.location.search, {
      parseNumbers: true,
      parseBooleans: true,
      arrayFormat: 'none'
    })
  }

  function getFromUrl(withDefault = false) {
    const q = getQuery()
    const result = q[field]
    if (type === 'string[]') {
      if (Array.isArray(result)) return result
      if (!result && defaultValue && withDefault) return defaultValue
      return result ? [result] : []
    }
    if (!result && defaultValue && withDefault) {
      return defaultValue
    }
    return result
  }

  function setToUrl(val: any) {
    const q = getQuery()
    if (val && (type !== 'string[]' || (Array.isArray(val) && val.length > 0))) {
      q[field] = val
    } else {
      delete q[field]
    }
    const prepend = Object.keys(q).length ? '?' : ''
    const newQuery = `${prepend}${queryString.stringify(q, { skipNull: true })}`
    window.history.replaceState(null, '', newQuery)
  }

  const val = ref(getFromUrl(true))

  const update = computed({
    get: () => val.value,
    set: (v: any) => {
      val.value = v
      setToUrl(v)
    }
  }) as any as WritableComputedRef<V>

  if (defaultValue && JSON.stringify(getFromUrl()) !== JSON.stringify(val.value)) {
    update.value = defaultValue
  }

  return update
}
