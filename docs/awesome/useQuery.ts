import { Ref, watch } from 'vue'
import queryString from 'query-string'

type MaybeArray<T> = T | T[]

type FieldType = MaybeArray<'string' | 'number' | 'boolean'>

export const useQuery = <T extends FieldType>(reference: Ref<T>, field: string) => {
  function getQuery() {
    return queryString.parse(window.location.search, {
      parseNumbers: true,
      parseBooleans: true,
      arrayFormat: 'none'
    })
  }

  function getFromUrl() {
    const q = getQuery()
    const result = q[field]
    // explicitly return false instead of undefined
    if (typeof reference.value === 'boolean' && !result) {
      return false
    }
    if (result == null) return
    if (Array.isArray(reference.value)) {
      return Array.isArray(result) ? result : [result]
    }
    return result
  }

  const fromUrl = getFromUrl()

  if (fromUrl != null) {
    // @ts-expect-error arbitrary type
    reference.value = fromUrl
  }

  function setToUrl(val: any) {
    const q = getQuery()
    if (val && (!Array.isArray(reference.value) || (Array.isArray(val) && val.length > 0))) {
      q[field] = val
    } else {
      delete q[field]
    }
    const prepend = Object.keys(q).length ? '?' : ''
    const newQuery = `${prepend}${queryString.stringify(q, { skipNull: true })}`
    window.history.replaceState(null, '', newQuery)
  }

  watch(
    reference,
    (val) => {
      setToUrl(val)
    },
    { immediate: true }
  )
}
