import assert from 'assert'
import { errorHandler } from '../src'

describe('Knex Error handler', () => {
  it('sqlState', () => {
    assert.throws(
      () =>
        errorHandler({
          sqlState: '#23503'
        }),
      {
        name: 'BadRequest'
      }
    )
  })

  it('sqliteError', () => {
    assert.throws(
      () =>
        errorHandler({
          code: 'SQLITE_ERROR',
          errno: 1
        }),
      {
        name: 'BadRequest'
      }
    )
    assert.throws(() => errorHandler({ code: 'SQLITE_ERROR', errno: 2 }), { name: 'Unavailable' })
    assert.throws(() => errorHandler({ code: 'SQLITE_ERROR', errno: 3 }), { name: 'Forbidden' })
    assert.throws(() => errorHandler({ code: 'SQLITE_ERROR', errno: 12 }), { name: 'NotFound' })
    assert.throws(() => errorHandler({ code: 'SQLITE_ERROR', errno: 13 }), { name: 'GeneralError' })
  })

  it('postgresqlError', () => {
    assert.throws(
      () =>
        errorHandler({
          code: '22P02',
          message: 'Key (id)=(1) is not present in table "users".',
          severity: 'ERROR',
          routine: 'ExecConstraints'
        }),
      {
        name: 'NotFound'
      }
    )
    assert.throws(
      () =>
        errorHandler({ code: '2874', message: 'Something', severity: 'ERROR', routine: 'ExecConstraints' }),
      {
        name: 'Forbidden'
      }
    )
    assert.throws(
      () =>
        errorHandler({ code: '3D74', message: 'Something', severity: 'ERROR', routine: 'ExecConstraints' }),
      {
        name: 'Unprocessable'
      }
    )
    assert.throws(() => errorHandler({ code: 'XYZ', severity: 'ERROR', routine: 'ExecConstraints' }), {
      name: 'GeneralError'
    })
  })
})
