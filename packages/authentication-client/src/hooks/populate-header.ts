import { HookContext, NextFunction } from '@feathersjs/feathers'

export const populateHeader = () => {
  return (context: HookContext, next: NextFunction) => {
    const {
      app,
      params: { accessToken }
    } = context
    const authentication = app.authentication

    // Set REST header if necessary
    if (app.rest && accessToken) {
      const { scheme, header } = authentication.options
      const authHeader = `${scheme} ${accessToken}`

      context.params.headers = Object.assign(
        {},
        {
          [header]: authHeader
        },
        context.params.headers
      )
    }

    return next()
  }
}
