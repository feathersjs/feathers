import { h, render } from 'vue'

/**
 * Renders the provided `Component` using the same rendering context as the provided `app` instance.
 * Refer to https://github.com/vuejs/core/issues/2097#issuecomment-707975628
 */
export const prependDynamicComponent = function (app, Component, id, props, el) {
  const firstTwoIds = [el.children?.[0], el.children?.[1]].map((el) => el?.id)
  if (firstTwoIds.includes(id)) {
    return
  }

  const childTree: any = h(Component, props)
  childTree.appContext = app._context

  // Creating a wrapper element here is clunky and ideally wouldn't be necessary
  const div = document.createElement('div')
  div.id = id
  el.prepend(div)

  render(childTree, div)

  return childTree.component.proxy
}
