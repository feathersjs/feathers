import errors from '@feathersjs/errors'
import { MongoError } from 'mongodb'

export function errorHandler (error: MongoError) {
  // See https://github.com/mongodb/mongo/blob/master/docs/errors.md
  if (error.name === 'MongoError') {
    throw new errors.GeneralError(error, {
      name: error.name,
      code: error.code
    })
  }

  throw error
}
