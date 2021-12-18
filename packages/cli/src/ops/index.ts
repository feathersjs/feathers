import { RenderAttributes } from '../types'

const resolve = async (attributes: RenderAttributes) => {
    const ops = []
    if (attributes.to && !attributes.inject) {
      const add = (await import('./add')).default
      ops.push(add)
    }
    if (attributes.to && attributes.inject) {
      const inject = (await import('./inject')).default
      ops.push(inject)
    }
    if (attributes.sh) {
      const shell = (await import('./shell')).default
      ops.push(shell)
    }
    return ops
  }
  export default resolve