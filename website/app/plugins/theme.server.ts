export default defineNuxtPlugin(() => {
  const colorMode = useCookie < 'light' | 'dark' > ('color-mode', {
    default: () => 'light',
  })

  useHead({
    htmlAttrs: {
      'data-theme': colorMode.value === 'dark' ? 'feathers-dark' : 'feathers-light',
    },
  })
})
