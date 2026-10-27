import assert from 'assert'
import knex from 'knex'
import { errorHandler, ERROR, KnexService } from '../src'

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
      () =>
        errorHandler(pgError('42703', 'select "a" - "b" from "t" - column "non-existent" does not exist')),
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

  it('sqlState errors omit query information', () => {
    assert.throws(
      () =>
        errorHandler({
          sqlState: '#23000',
          message:
            "insert into `users` (`email`) values ('a@example.com') - ER_DUP_ENTRY: Duplicate entry 'a@example.com' for key 'email'"
        }),
      { name: 'BadRequest', message: "ER_DUP_ENTRY: Duplicate entry 'a@example.com' for key 'email'" }
    )
  })

  it('SQLite errors omit query information', () => {
    assert.throws(
      () =>
        errorHandler({
          code: 'SQLITE_ERROR',
          errno: 1,
          message: "select `users`.* from `users` where `nope` = 'x' - SQLITE_ERROR: no such column: nope"
        }),
      { name: 'BadRequest', message: 'SQLITE_ERROR: no such column: nope' }
    )
  })

  it('other database errors omit query information', () => {
    assert.throws(
      () =>
        errorHandler({
          code: 'SQLITE_CONSTRAINT',
          errno: 19,
          message:
            "insert into `users` (`password`) values ('secret') - SQLITE_CONSTRAINT: UNIQUE constraint failed: users.email"
        }),
      { name: 'GeneralError', message: 'SQLITE_CONSTRAINT: UNIQUE constraint failed: users.email' }
    )
  })

  it('MySQL errors keep the driver message when values contain " - "', () => {
    assert.throws(
      () =>
        errorHandler({
          code: 'ER_DUP_ENTRY',
          errno: 1062,
          sqlState: '23000',
          sqlMessage: "Duplicate entry 'foo - bar' for key 'name'",
          message:
            "insert into `t` (`name`) values ('foo - bar') - ER_DUP_ENTRY: Duplicate entry 'foo - bar' for key 'name'"
        }),
      { name: 'BadRequest', message: "ER_DUP_ENTRY: Duplicate entry 'foo - bar' for key 'name'" }
    )
    assert.throws(
      () =>
        errorHandler({
          code: 'ER_DUP_ENTRY',
          errno: 1062,
          sqlState: '23000',
          sqlMessage: "Duplicate entry 'foo - bar' for key 'name'",
          message:
            "insert into `t` (`name`) values ('foo - bar') - Duplicate entry 'foo - bar' for key 'name'"
        }),
      { name: 'BadRequest', message: "Duplicate entry 'foo - bar' for key 'name'" }
    )
  })

  it('SQLite errors keep the driver message when values contain " - "', () => {
    assert.throws(
      () =>
        errorHandler({
          code: 'SQLITE_CONSTRAINT',
          errno: 19,
          message:
            "insert into `t` (`name`) values ('a - b') - SQLITE_CONSTRAINT: UNIQUE constraint failed: t.name - x"
        }),
      { name: 'GeneralError', message: 'SQLITE_CONSTRAINT: UNIQUE constraint failed: t.name - x' }
    )
  })

  it('knex compile errors omit the query', () => {
    assert.throws(
      () =>
        errorHandler(
          new Error(
            'Undefined binding(s) detected when compiling SELECT. Undefined column(s): [users.id] query: select "users".* from "users" where "users"."id" = ?'
          )
        ),
      {
        name: 'GeneralError',
        message: 'Undefined binding(s) detected when compiling SELECT. Undefined column(s): [users.id]'
      }
    )
  })

  it('errors without a message keep the default message', () => {
    assert.throws(() => errorHandler({ code: 'ECONNRESET' }), { name: 'GeneralError', message: 'Error' })
  })

  it('errors that are not from the database keep their message', () => {
    assert.throws(() => errorHandler(new Error('Pool - closed')), {
      name: 'GeneralError',
      message: 'Pool - closed'
    })
  })

  it('MySQL errors with an empty sqlMessage use the fallback', () => {
    assert.throws(
      () =>
        errorHandler({
          code: 'ER_X',
          errno: 1,
          sqlState: '42000',
          sqlMessage: '',
          message: 'select 1 - ER_X: oops'
        } as any),
      { name: 'BadRequest', message: 'ER_X: oops' }
    )
  })

  it('MSSQL errors omit query information', () => {
    assert.throws(
      () =>
        errorHandler({
          code: 'EREQUEST',
          number: 2627,
          message:
            "insert into [users] ([email]) values ('a@example.com') - Violation of UNIQUE KEY constraint 'UQ_users'."
        } as any),
      { name: 'GeneralError', message: "Violation of UNIQUE KEY constraint 'UQ_users'." }
    )
  })

  it('does not leak queries or bound values from a real database', async () => {
    const db = knex({ client: 'sqlite3', connection: { filename: ':memory:' }, useNullAsDefault: true })

    try {
      await db.schema.createTable('users', (table) => {
        table.increments('id')
        table.string('email').unique()
        table.string('password')
      })
      const service = new KnexService({ Model: db, name: 'users' })

      await service.create({ email: 'a@example.com', password: 'hash-1' })

      await assert.rejects(
        () => service.create({ email: 'a@example.com', password: 'secret-hash-2' }),
        (error: any) => {
          assert.ok(!error.message.includes('insert into'))
          assert.ok(!error.message.includes('secret-hash-2'))
          assert.ok(!error.toJSON().message.includes('insert into'))
          assert.ok(!error.toJSON().message.includes('secret-hash-2'))
          return true
        }
      )
      const other = await service.create({ email: 'b@example.com', password: 'hash-3' })

      await assert.rejects(
        () => service.patch(other.id, { email: 'a@example.com', password: 'secret-hash-4' }),
        (error: any) => {
          assert.ok(!error.message.includes('update'))
          assert.ok(!error.message.includes('secret-hash-4'))
          return true
        }
      )
      await assert.rejects(
        () => service.find({ query: { nope: 'x' } } as any),
        (error: any) => {
          assert.ok(!error.message.includes('select'))
          return true
        }
      )
    } finally {
      await db.destroy()
    }
  })
})
