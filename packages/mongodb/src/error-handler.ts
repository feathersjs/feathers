import { GeneralError } from '@feathersjs/errors'
import { MongoError } from 'mongodb'

export function errorHandler(error: MongoError): any {
  // See https://github.com/mongodb/mongo/blob/master/docs/errors.md
  if (error && error.name && error.name.startsWith('Mongo')) {
    throw new GeneralError(error, {
      name: error.name,
      code: error.code
    })
  }

  throw error
}
