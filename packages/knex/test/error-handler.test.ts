import assert from 'assert'
import { errorHandler, ERROR } from '../src'

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

  it('postgresqlError omits query information from the Feathers error', () => {
    const pgError = (code: string, message: string) => ({
      code,
      message,
      severity: 'ERROR',
      routine: 'ExecConstraints'
    })

    assert.throws(
      () =>
        errorHandler(
          pgError(
            '22P02',
            'select "users".* from "users" where "id" = $1 limit $2 - invalid input syntax for type uuid: "1"'
          )
        ),
      {
        name: 'NotFound',
        message: 'invalid input syntax for type uuid: "1"'
      }
    )

    assert.throws(
      () =>
        errorHandler(
          pgError(
            '23505',
            'insert into "users" ("email") values ($1) returning * - duplicate key value violates unique constraint "users_email_unique"'
          )
        ),
      {
        name: 'BadRequest',
        message: 'duplicate key value violates unique constraint "users_email_unique"'
      }
    )

    // A " - " inside the SQL and a hyphen in the error text are both handled
    assert.throws(
      () => errorHandler(pgError('42703', 'select "a" - "b" from "t" - column "non-existent" does not exist')),
      {
        name: 'Unprocessable',
        message: 'column "non-existent" does not exist'
      }
    )
  })

  it('postgresqlError keeps the raw error for server-side handling', () => {
    try {
      errorHandler({
        code: '23505',
        message: 'insert into "users" ("email") values ($1) - duplicate key value',
        severity: 'ERROR',
        routine: 'ExecConstraints',
        constraint: 'users_email_unique'
      })
      assert.fail('should have thrown')
    } catch (error: any) {
      assert.strictEqual(error[ERROR].code, '23505')
      assert.strictEqual(error[ERROR].constraint, 'users_email_unique')
    }
  })
})
