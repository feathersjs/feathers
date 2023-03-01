import { errors } from '@feathersjs/errors'

export const ERROR = Symbol.for('@feathersjs/knex/error')

export function errorHandler(error: any) {
  const { message } = error
  let feathersError = error

  if (error.sqlState && error.sqlState.length) {
    // remove SQLSTATE marker (#) and pad/truncate SQLSTATE to 5 chars
    const sqlState = ('00000' + error.sqlState.replace('#', '')).slice(-5)

    switch (sqlState.slice(0, 2)) {
      case '02':
        feathersError = new errors.NotFound(message)
        break
      case '28':
        feathersError = new errors.Forbidden(message)
        break
      case '08':
      case '0A':
      case '0K':
        feathersError = new errors.Unavailable(message)
        break
      case '20':
      case '21':
      case '22':
      case '23':
      case '24':
      case '25':
      case '40':
      case '42':
      case '70':
        feathersError = new errors.BadRequest(message)
        break
      default:
        feathersError = new errors.GeneralError(message)
    }
  } else if (error.code === 'SQLITE_ERROR') {
    // NOTE (EK): Error codes taken from
    // https://www.sqlite.org/c3ref/c_abort.html
    switch (error.errno) {
      case 1:
      case 8:
      case 18:
      case 19:
      case 20:
        feathersError = new errors.BadRequest(message)
        break
      case 2:
        feathersError = new errors.Unavailable(message)
        break
      case 3:
      case 23:
        feathersError = new errors.Forbidden(message)
        break
      case 12:
        feathersError = new errors.NotFound(message)
        break
      default:
        feathersError = new errors.GeneralError(message)
        break
    }
  } else if (typeof error.code === 'string' && error.severity && error.routine) {
    // NOTE: Error codes taken from
    // https://www.postgresql.org/docs/9.6/static/errcodes-appendix.html
    // Omit query information
    const messages = (error.message || '').split('-')

    error.message = messages[messages.length - 1]

    switch (error.code.slice(0, 2)) {
      case '22':
        feathersError = new errors.NotFound(message)
        break
      case '23':
        feathersError = new errors.BadRequest(message)
        break
      case '28':
        feathersError = new errors.Forbidden(message)
        break
      case '3D':
      case '3F':
      case '42':
        feathersError = new errors.Unprocessable(message)
        break
      default:
        feathersError = new errors.GeneralError(message)
        break
    }
  } else if (!(error instanceof errors.FeathersError)) {
    feathersError = new errors.GeneralError(message)
  }

  feathersError[ERROR] = error

  throw feathersError
}
