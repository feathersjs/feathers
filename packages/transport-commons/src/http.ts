import { MethodNotAllowed } from '@feathersjs/errors/lib'
import {
  HookContext,
  NullableId,
  Params,
  getServiceOptions,
  getServiceMethodArgs,
  MethodDefinition
} from '@feathersjs/feathers'
import encodeUrl from 'encodeurl'
import kebabCase from 'lodash/kebabCase'

export const METHOD_HEADER = 'x-service-method'

export interface ServiceParams {
  id: NullableId
  data: any
  params: Params
}

export const statusCodes = {
  created: 201,
  noContent: 204,
  methodNotAllowed: 405,
  success: 200,
  seeOther: 303
}

function getMethodRoute(method: MethodDefinition) {
  const methodRoute = typeof method.route === 'string' ? method.route : kebabCase(method.key)
  return methodRoute
}

export function getServiceMethod(
  _httpMethod: string,
  id: unknown,
  action: unknown,
  service: any,
  headerOverride?: string
) {
  const httpMethod = _httpMethod.toLowerCase()

  const { serviceMethods } = getServiceOptions(service)
  if (httpMethod === 'post' && headerOverride) {
    const method = serviceMethods.find((method) => method.key === headerOverride)
    return method
  }

  const potentialMethods = serviceMethods.filter(
    (method) => method.route !== false && method.routeMethod.toLowerCase() === httpMethod.toLowerCase()
  )

  // find the case where the action is the id as the method does not have an id in the args
  let foundMethod = potentialMethods.find((method) => {
    const methodRoute = getMethodRoute(method)
    return !method.id && !action && (id || '') === methodRoute
  })
  if (foundMethod) {
    return foundMethod
  }

  foundMethod = potentialMethods.find((method) => {
    const methodRoute = getMethodRoute(method)
    return method.id && methodRoute === (action || '')
  })
  if (foundMethod) {
    return foundMethod
  }

  if (!['get', 'post', 'patch', 'put', 'delete'].includes(_httpMethod.toLowerCase())) {
    throw new MethodNotAllowed(`Method ${_httpMethod} not allowed`)
  }
  return null
}

export function argumentsFor(method: MethodDefinition) {
  return (serviceParams: ServiceParams) => {
    const args = getServiceMethodArgs(method)
    return args.map((arg) => serviceParams[arg])
  }
}

export function getStatusCode(context: HookContext, body: any, location: string | string[]) {
  const { http = {} } = context

  if (http.status) {
    return http.status
  }

  if (context.method === 'create') {
    return statusCodes.created
  }

  if (location !== undefined) {
    return statusCodes.seeOther
  }

  if (!body) {
    return statusCodes.noContent
  }

  return statusCodes.success
}

export function getResponse(context: HookContext) {
  const { http = {} } = context
  const body = context.dispatch !== undefined ? context.dispatch : context.result

  let headers = http.headers || {}
  let location = headers.Location

  if (http.location !== undefined) {
    location = encodeUrl(http.location)
    headers = { ...headers, Location: location }
  }

  const status = getStatusCode(context, body, location)

  return { status, headers, body }
}
