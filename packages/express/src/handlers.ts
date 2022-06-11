import path from 'path'
import { NotFound, GeneralError } from '@feathersjs/errors'
import { Request, Response, NextFunction, ErrorRequestHandler, RequestHandler } from 'express'

const defaults = {
  public: path.resolve(__dirname, '..', 'public'),
  logger: console
}
const defaultHtmlError = path.resolve(defaults.public, 'default.html')

export function notFound({ verbose = false } = {}): RequestHandler {
  return function (req: Request, _res: Response, next: NextFunction) {
    const url = `${req.url}`
    const message = `Page not found${verbose ? ': ' + url : ''}`

    next(new NotFound(message, { url }))
  }
}

export type ErrorHandlerOptions = {
  public?: string
  logger?: boolean | { error?: (msg: any) => void; info?: (msg: any) => void }
  html?: any
  json?: any
}

export function errorHandler(_options: ErrorHandlerOptions = {}): ErrorRequestHandler {
  const options = Object.assign({}, defaults, _options)

  if (typeof options.html === 'undefined') {
    options.html = {
      401: path.resolve(options.public, '401.html'),
      404: path.resolve(options.public, '404.html'),
      default: defaultHtmlError
    }
  }

  if (typeof options.json === 'undefined') {
    options.json = {}
  }

  return function (error: any, req: Request, res: Response, next: NextFunction) {
    // Set the error code for HTTP processing semantics
    error.code = !isNaN(parseInt(error.code, 10)) ? parseInt(error.code, 10) : 500

    // Log the error if it didn't come from a service method call
    if (options.logger && typeof options.logger.error === 'function' && !res.hook) {
      if (error.code >= 500) {
        options.logger.error(error)
      } else {
        options.logger.info(error)
      }
    }

    if (error.type !== 'FeathersError') {
      const oldError = error

      error = oldError.errors
        ? new GeneralError(oldError.message, {
            errors: oldError.errors
          })
        : new GeneralError(oldError.message)

      if (oldError.stack) {
        error.stack = oldError.stack
      }
    }

    const formatter: { [key: string]: any } = {}

    // If the developer passed a custom function for ALL html errors
    if (typeof options.html === 'function') {
      formatter['text/html'] = options.html
    } else {
      let file = options.html[error.code]
      if (!file) {
        file = options.html.default || defaultHtmlError
      }
      // If the developer passed a custom function for individual html errors
      if (typeof file === 'function') {
        formatter['text/html'] = file
      } else {
        formatter['text/html'] = function () {
          res.set('Content-Type', 'text/html')
          res.sendFile(file)
        }
      }
    }

    // If the developer passed a custom function for ALL json errors
    if (typeof options.json === 'function') {
      formatter['application/json'] = options.json
    } else {
      const handler = options.json[error.code] || options.json.default
      // If the developer passed a custom function for individual json errors
      if (typeof handler === 'function') {
        formatter['application/json'] = handler
      } else {
        // Don't show stack trace if it is a 404 error
        if (error.code === 404) {
          error.stack = null
        }

        formatter['application/json'] = function () {
          const output = Object.assign({}, error.toJSON())

          if (process.env.NODE_ENV === 'production') {
            delete output.stack
          }

          res.set('Content-Type', 'application/json')
          res.json(output)
        }
      }
    }

    res.status(error.code)

    const contentType = req.headers['content-type'] || ''
    const accepts = req.headers.accept || ''

    // by default just send back json
    if (contentType.indexOf('json') !== -1 || accepts.indexOf('json') !== -1) {
      formatter['application/json'](error, req, res, next)
    } else if (options.html && (contentType.indexOf('html') !== -1 || accepts.indexOf('html') !== -1)) {
      formatter['text/html'](error, req, res, next)
    } else {
      // TODO (EK): Maybe just return plain text
      formatter['application/json'](error, req, res, next)
    }
  }
}
